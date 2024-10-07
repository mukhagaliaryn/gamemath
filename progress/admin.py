from django.contrib import admin
from .models import UserCourseProgress, UserLessonProgress, UserVideoProgress, UserTestProgress, UserTaskProgress


@admin.register(UserCourseProgress)
class UserCourseProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'started', 'completed', 'date_started', 'date_completed')
    list_filter = ('started', 'completed', 'date_started', 'date_completed')
    search_fields = ('user__username', 'course__title')


@admin.register(UserLessonProgress)
class UserLessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'started', 'completed', 'date_started', 'date_completed')
    list_filter = ('started', 'completed', 'date_started', 'date_completed')
    search_fields = ('user__username', 'lesson__title')


@admin.register(UserVideoProgress)
class UserVideoProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'watched_duration', 'completed')
    list_filter = ('completed',)
    search_fields = ('user__username', 'video__lesson__title')


@admin.register(UserTestProgress)
class UserTestProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'score', 'completed')
    list_filter = ('completed', 'score')
    search_fields = ('user__username', 'test__lesson__title')


@admin.register(UserTaskProgress)
class UserTaskProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'task', 'answer', 'completed')
    list_filter = ('completed',)
    search_fields = ('user__username', 'task__lesson__title')
