from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from workspace.models import Quiz, QuizControl


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
    qs = Quiz.objects.all()
    added_quizzes = QuizControl.objects.filter(user=request.user).values_list('quiz_id', flat=True)
    context = {
        'quizzes': qs,
        'added_quizzes': added_quizzes,
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
def delete_quiz_control(request, pk):
    quiz_control = get_object_or_404(QuizControl, pk=pk, user=request.user)

    if request.method == 'POST':
        quiz_control.delete()
        messages.success(request, 'Таңдалған ойын өшірілді')
        return redirect('home')

    return redirect('home')


# Quiz detail
@login_required(login_url='/accounts/login/')
def quiz_detail_view(request, pk):
    quiz = get_object_or_404(Quiz, pk=pk)
    questions = quiz.quiz_questions.all()
    context = {
        'quiz': quiz,
        'questions': questions
    }
    return render(request, 'quizzes/detail.html', context)
