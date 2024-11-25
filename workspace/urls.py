from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('quizzes/', views.quizzes_view, name='quizzes'),
]
