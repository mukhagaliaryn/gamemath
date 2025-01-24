from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin, SummernoteModelAdminMixin
from workspace.models import Category, Question, Quiz, Option, Interface


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', )


class InterfaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'slug', 'order', )
    list_filter = ('category', )

# Quiz
# ----------------------------------------------------------------------------------------------------------------------
class QuestionTab(SummernoteModelAdminMixin, admin.StackedInline, ):
    model = Question
    extra = 0


class QuizAdmin(SummernoteModelAdmin):
    list_display = ('title', 'interface', 'category', 'order', )
    list_filter = ('interface', )

    inlines = (QuestionTab, )


# Question
# ----------------------------------------------------------------------------------------------------------------------
class OptionTab(SummernoteModelAdminMixin, admin.TabularInline, ):
    model = Option
    extra = 0


class QuestionAdmin(SummernoteModelAdmin):
    list_filter = ('quiz', 'question_type', )
    inlines = (OptionTab, )


admin.site.register(Interface, InterfaceAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Quiz, QuizAdmin)
admin.site.register(Question, QuestionAdmin)
