from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin, SummernoteModelAdminMixin
from workspace.models import Question, Quiz, Option, Interface


class InterfaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', )


# Quiz
# ----------------------------------------------------------------------------------------------------------------------
class QuestionTab(SummernoteModelAdminMixin, admin.StackedInline, ):
    model = Question
    extra = 0


class QuizAdmin(SummernoteModelAdmin):
    list_display = ('title', 'interface', )
    list_filter = ('interface', )

    inlines = (QuestionTab, )


# Question
# ----------------------------------------------------------------------------------------------------------------------
class OptionTab(SummernoteModelAdminMixin, admin.TabularInline, ):
    model = Option
    extra = 0


class QuestionAdmin(SummernoteModelAdmin):
    list_display = ('pk', 'quiz', 'question_type', )
    list_filter = ('quiz', 'question_type', )
    inlines = (OptionTab, )


admin.site.register(Interface, InterfaceAdmin)
admin.site.register(Quiz, QuizAdmin)
admin.site.register(Question, QuestionAdmin)
