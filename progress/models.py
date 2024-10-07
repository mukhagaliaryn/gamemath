from django.db import models
from accounts.models import User
from workspace.models import Course, Lesson, Video, Test, Task


# UserCourseProgress
class UserCourseProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    started = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    date_started = models.DateTimeField(null=True, blank=True)
    date_completed = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} - {self.course.title} - Прогресс курса'


# UserLessonProgress
class UserLessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    started = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    date_started = models.DateTimeField(null=True, blank=True)
    date_completed = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} - {self.lesson.title} - Прогресс урока'


# Прогресс по видео
class UserVideoProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    watched_duration = models.DurationField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.username} - {self.video.lesson.title} - Прогресс видео'


# Прогресс по тесту
class UserTestProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.IntegerField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.username} - {self.test.lesson.title} - Прогресс теста'


# Прогресс по заданию
class UserTaskProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    answer = models.TextField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.username} - {self.task.lesson.title} - Прогресс задания'