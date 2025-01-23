from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from workspace.models import Quiz, QuizControl, UserQuiz, UserAnswer, Option, Category
import uuid
import random
import json


# Home page
# ----------------------------------------------------------------------------------------------------------------------
@login_required(login_url='/accounts/login/')
def home_view(request):
    user = request.user
    context = {
        'user_profile': user,
    }
    return render(request, 'index.html', context)


# Categories page
# ----------------------------------------------------------------------------------------------------------------------
@login_required(login_url='/accounts/login/')
def categories_view(request):
    items = Category.objects.all()
    context = {
        'categories': items,
    }

    return render(request, 'categories/index.html', context)


# Quizzes page
# ----------------------------------------------------------------------------------------------------------------------
@login_required(login_url='/accounts/login/')
def category_detail_view(request, slug):
    item = get_object_or_404(Category, slug=slug)
    quizzes = Quiz.objects.all()
    quiz_controls = QuizControl.objects.filter(user=request.user)
    quizzes_with_controls = {qc.quiz_id: qc.id for qc in quiz_controls}
    context = {
        'item': item,
        'quizzes': quizzes,
        'quizzes_with_controls': quizzes_with_controls,
    }

    return render(request, 'categories/category_detail.html', context)


# Quiz control page
# ----------------------------------------------------------------------------------------------------------------------
@login_required(login_url='/accounts/login/')
def quiz_control_detail_view(request, pk):
    quiz_control = get_object_or_404(QuizControl, pk=pk)
    context = {
        'quiz_control': quiz_control,
    }
    return render(request, 'quiz/index.html', context)


# create quiz control
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
            status='started',
            date_started=timezone.now(),
        )
        messages.success(request, f'"{quiz.title}" ойыны іске қосылды қосылды!')
        return redirect('home')
    return redirect('quizzes')


# Finish quiz control
@login_required
def finish_quiz_control(request, pk):
    quiz_control = get_object_or_404(QuizControl, pk=pk, user=request.user)
    if quiz_control.status == 'FINISHED':
        messages.warning(request, 'Бұл ойын аяқталып қойған!')
        return redirect('home')

    quiz_control.status = 'finished'
    quiz_control.date_finished = timezone.now()
    quiz_control.save()
    messages.warning(request, 'Ойын аяқталды!')
    return redirect('home')


# Delete quiz control
@login_required
def delete_quiz_control(request, pk):
    quiz_control = get_object_or_404(QuizControl, pk=pk, user=request.user)
    if request.method == 'POST':
        quiz_control.delete()
        messages.success(request, 'Таңдалған ойын өшірілді')
        return redirect('home')

    return redirect('home')


# Start quiz page
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

    return render(request, 'quiz/start.html', {'quiz_control': quiz_control})


# Quiz game page
# ----------------------------------------------------------------------------------------------------------------------
@csrf_exempt
def quiz_test_view(request, pk, session_id):
    quiz_control = get_object_or_404(QuizControl, id=pk)
    user_quiz = get_object_or_404(UserQuiz, quiz_control=quiz_control, session_id=session_id)

    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        questions = []
        for question in quiz_control.quiz.questions.all():
            options = Option.objects.filter(question=question)
            questions.append({
                "id": question.id,
                'order': question.order,
                "question_body": question.question_body,
                "options": [
                    {
                        "id": option.id,
                        "option_body": option.option_body,
                        "is_correct": option.is_correct,
                        "score": option.score
                    } for option in options]
            })

        data = {
            "quiz_id": quiz_control.id,
            "title": quiz_control.quiz.title,
            "session_id": session_id,
            "questions": questions
        }
        return JsonResponse(data)

    if request.method == 'POST' and request.headers.get('Content-Type') == 'application/json':
        try:
            data = json.loads(request.body)
            answers = data.get('answers', [])
            for answer in answers:
                question_id = answer.get('question_id')
                answer_ids = answer.get('selected_option_ids', [])

                if question_id and answer_ids:
                    question = quiz_control.quiz.questions.get(id=question_id)
                    user_answer = UserAnswer.objects.create(user_quiz=user_quiz)
                    user_answer.answers.set(Option.objects.filter(id__in=answer_ids))
                    user_answer.score = sum(option.score for option in user_answer.answers.all())
                    user_answer.save()

            user_quiz.total_score = sum(answer.score for answer in user_quiz.user_answers.all())
            user_quiz.status = 'finished'
            user_quiz.save()

            return JsonResponse({"status": "success", "total_score": user_quiz.total_score})

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=400)

    template_name = f"quiz/games/{user_quiz.quiz.interface.slug}.html"
    context = {
        'quiz_control': quiz_control,
        'user_quiz': user_quiz,
        'questions': quiz_control.quiz.questions.all(),
    }
    return render(request, template_name, context)


# Quiz result page
# ----------------------------------------------------------------------------------------------------------------------
def quiz_result(request, pk):
    user_quiz = get_object_or_404(UserQuiz, id=pk)
    questions = user_quiz.quiz.questions.all()
    results = []

    for question in questions:
        correct_answers = question.options.filter(score__gt=0)
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
    return render(request, 'quiz/result.html', context)
