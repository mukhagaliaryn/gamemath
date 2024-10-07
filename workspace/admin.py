from django.contrib import admin
from .models import Category, Lesson, Video, Test, Task, TestOption, Course


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_at', 'updated_at', )
    search_fields = ('title',)


class VideoInline(admin.TabularInline):
    model = Video
    extra = 1


class TestInline(admin.TabularInline):
    model = Test
    extra = 1


class TaskInline(admin.TabularInline):
    model = Task
    extra = 1


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'created_at', 'updated_at')
    search_fields = ('title',)
    list_filter = ('course',)
    inlines = [VideoInline, TestInline, TaskInline]


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'video_url', 'duration', )
    list_filter = ('lesson',)


class TestOptionInline(admin.TabularInline):
    model = TestOption
    extra = 2


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'question',)
    list_filter = ('lesson',)
    inlines = [TestOptionInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'description', 'correct_answer',)
    list_filter = ('lesson',)
