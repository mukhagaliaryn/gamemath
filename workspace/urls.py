from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('quizzes/', views.quizzes_view, name='quizzes'),
    path('quiz/control/add/', views.create_quiz_control, name='create_quiz_control'),
    path('quiz/control/<int:pk>/finish/', views.finish_quiz_control, name='finish_quiz_control'),
    path('quiz/control/<int:pk>/delete/', views.delete_quiz_control, name='delete_quiz_control'),
    path('quiz/control/<int:pk>/', views.quiz_control_detail_view, name='quiz_control_detail'),
    path('quiz/control/<int:pk>/view/', views.quiz_control_game_view, name='quiz_control_game'),
]
