from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('courses/', views.courses_view, name='courses'),
    path('course/<int:pk>/', views.course_detail_view, name='course_detail'),
    path('course/<int:pk>/start-or-continue/', views.start_or_continue_course, name='start_or_continue_course'),

    path('lesson/<int:pk>/', views.lesson_detail_view, name='lesson_detail'),
    path('video/<int:video_id>/mark-watched/', views.mark_video_watched, name='mark_video_watched'),
    path('lesson/<int:lesson_id>/submit-test/', views.submit_test, name='submit_test'),
    path('lesson/<int:lesson_id>/submit-task/', views.submit_task, name='submit_task'),
    path('lesson/<int:pk>/complete/', views.complete_lesson, name='complete_lesson'),
    path('course/<int:pk>/complete/', views.complete_course, name='complete_course'),
]
