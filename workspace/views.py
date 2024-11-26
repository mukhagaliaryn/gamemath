from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.shortcuts import render, get_object_or_404, redirect

from workspace.models import Quiz


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
    context = {
        'quizzes': qs
    }

    return render(request, 'quizzes/index.html', context)


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
