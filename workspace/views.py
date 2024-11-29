from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from workspace.models import Quiz, QuizControl, UserQuiz, UserAnswer, Option
import uuid


# Home page
@login_required(login_url='/accounts/login/')
def home_view(request):
    user = request.user
    context = {
        'user_profile': user,
    }

    return render(request, 'index.html', context)


# Quizzes
@login_required(login_url='/accounts/login/')
def quizzes_view(request):
    quizzes = Quiz.objects.all()
    quiz_controls = QuizControl.objects.filter(user=request.user)
    quizzes_with_controls = {qc.quiz_id: qc.id for qc in quiz_controls}
    context = {
        'quizzes': quizzes,
        'quizzes_with_controls': quizzes_with_controls,
    }

    return render(request, 'quizzes/index.html', context)


# create quiz
@login_required
def create_quiz_control(request):
    if request.method == 'POST':
        quiz_id = request.POST.get('quiz_id')
        if not quiz_id:
            messages.error(request, 'Quiz ID берілген жоқ.')
            return redirect('quizzes')

        quiz = get_object_or_404(Quiz, pk=quiz_id)

        QuizControl.objects.create(
            user=request.user,
            quiz=quiz,
            status='STARTED',
            date_started=timezone.now(),
        )
        messages.success(request, f'"{quiz.title}" ойыны іске қосылды қосылды!')
        return redirect('home')
    return redirect('quizzes')


@login_required
def finish_quiz_control(request, pk):
    quiz_control = get_object_or_404(QuizControl, pk=pk, user=request.user)

    if quiz_control.status == 'FINISHED':
        messages.warning(request, 'Бұл ойын аяқталып қойған!')
        return redirect('home')

    quiz_control.status = 'FINISHED'
    quiz_control.date_finished = timezone.now()
    quiz_control.save()
    messages.warning(request, 'Ойын аяқталды!')
    return redirect('home')


@login_required
def delete_quiz_control(request, pk):
    quiz_control = get_object_or_404(QuizControl, pk=pk, user=request.user)

    if request.method == 'POST':
        quiz_control.delete()
        messages.success(request, 'Таңдалған ойын өшірілді')
        return redirect('home')

    return redirect('home')


# Quiz detail
@login_required(login_url='/accounts/login/')
def quiz_control_detail_view(request, pk):
    quiz_control = get_object_or_404(QuizControl, pk=pk)
    context = {
        'quiz_control': quiz_control,
    }
    return render(request, 'quizzes/detail.html', context)


# Quiz control game
# ----------------------------------------------------------------------------------------------------------------------
def start_quiz_session(request, pk):
    quiz_control = get_object_or_404(QuizControl, id=pk)

    if request.method == 'POST':
        session_id = uuid.uuid4()

        username = request.POST.get('username', 'Anonymous')
        UserQuiz.objects.create(
            quiz_control=quiz_control,
            quiz=quiz_control.quiz,
            session_id=session_id,
            username=username,
        )
        return redirect('quiz_test_view', pk=pk, session_id=session_id)

    return render(request, 'quizzes/start.html', {'quiz_control': quiz_control})


def quiz_test_view(request, pk, session_id):
    quiz_control = get_object_or_404(QuizControl, id=pk)
    user_quiz = get_object_or_404(UserQuiz, quiz_control=quiz_control, session_id=session_id)

    if request.method == 'POST':
        questions = quiz_control.quiz.quiz_questions.all()
        for question in questions:
            answer_ids = request.POST.getlist(f'question_{question.id}')
            if answer_ids:
                user_answer, _ = UserAnswer.objects.get_or_create(user_quiz=user_quiz, score=0)
                user_answer.answers.set(Option.objects.filter(id__in=answer_ids))
                user_answer.score = sum(option.score for option in user_answer.answers.all())
                user_answer.save()

        user_quiz.total_score = sum(answer.score for answer in user_quiz.uq_answers.all())
        user_quiz.status = 'FINISHED'
        user_quiz.save()

        return redirect('quiz_result', pk=user_quiz.id)

    context = {
        'quiz_control': quiz_control,
        'user_quiz': user_quiz,
        'questions': quiz_control.quiz.quiz_questions.all(),
    }
    return render(request, 'quizzes/game.html', context)


def quiz_result(request, pk):
    user_quiz = get_object_or_404(UserQuiz, id=pk)
    questions = user_quiz.quiz.quiz_questions.all()
    results = []

    for question in questions:
        correct_answers = question.q_options.filter(score__gt=0)
        user_answer = UserAnswer.objects.filter(user_quiz=user_quiz, answers__question=question).first()
        results.append({
            'question': question.question_body,
            'correct_answers': correct_answers,
            'user_answers': user_answer.answers.all() if user_answer else [],
            'is_correct': (
                user_answer and
                set(user_answer.answers.values_list('id', flat=True)) == set(correct_answers.values_list('id', flat=True))
            ),
        })

    context = {
        'user_quiz': user_quiz,
        'results': results,
    }
    return render(request, 'quizzes/result.html', context)
