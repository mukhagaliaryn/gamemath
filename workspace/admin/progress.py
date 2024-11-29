from django.contrib import admin
from workspace.models import QuizControl, UserQuiz, UserAnswer


# QuizControl
# ----------------------------------------------------------------------------------------------------------------------
class UserQuizTab(admin.TabularInline):
    model = UserQuiz
    extra = 0


class QuizControlAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'user', 'date_started', 'date_finished', 'status',)
    list_filter = ('quiz', 'user', 'status', )
    inlines = (UserQuizTab, )


# UserQuiz
# ----------------------------------------------------------------------------------------------------------------------
class UserAnswerTab(admin.TabularInline):
    model = UserAnswer
    extra = 0


class UserQuizAdmin(admin.ModelAdmin):
    list_display = ('quiz_control', 'quiz', 'username', 'total_score', 'status', )
    list_filter = ('quiz_control', 'quiz', )
    inlines = (UserAnswerTab, )


admin.site.register(QuizControl, QuizControlAdmin)
admin.site.register(UserQuiz, UserQuizAdmin)
