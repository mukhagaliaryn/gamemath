from django.db import models
from django.utils.translation import gettext_lazy as _


# Course Category
class Category(models.Model):
    name = models.CharField(_('Name'), max_length=255, unique=True)
    description = models.TextField(_('Description'), blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')


# Course
class Course(models.Model):
    category = models.ForeignKey(
        Category, related_name='courses', on_delete=models.CASCADE,
        verbose_name=_('Category')
    )
    title = models.CharField(_('Title'), max_length=255)
    description = models.TextField(_('Description'), blank=True, null=True)
    poster = models.ImageField(upload_to='courses/posters/', blank=True, null=True)
    created_at = models.DateTimeField(_('Created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated at'), auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')


# Course Lesson
class Lesson(models.Model):
    course = models.ForeignKey(
        Course, related_name='lessons', on_delete=models.CASCADE,
        verbose_name=_('Course')
    )
    title = models.CharField(_('Title'), max_length=255)
    description = models.TextField(_('Description'), blank=True, null=True)
    created_at = models.DateTimeField(_('Created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated at'), auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('Lesson')
        verbose_name_plural = _('Lessons')


class Content(models.Model):
    lesson = models.ForeignKey(Lesson, related_name='contents', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(_('Order'), default=0)

    class Meta:
        abstract = True
        ordering = ('order', )

    def __str__(self):
        return f'Content for {self.lesson}'


# Lesson Video
class Video(Content):
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE,
        related_name='video_all', verbose_name=_('Lesson')
    )
    video_url = models.URLField(_('Video URL'), max_length=500)
    duration = models.DurationField(_('Duration'))

    class Meta:
        verbose_name = _('Video')
        verbose_name_plural = _('Video')

    def __str__(self):
        return f'Video: {self.video_url} (Lesson: {self.lesson})'


# Lesson Test
class Test(Content):
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE,
        related_name='tests', verbose_name=_('Lesson')
    )
    question = models.TextField(_('Question'), max_length=500)

    class Meta:
        verbose_name = _('Test')
        verbose_name_plural = _('Tests')

    def __str__(self):
        return f'Test: {self.question} (Lesson: {self.lesson})'


# Test options
class TestOption(models.Model):
    test = models.ForeignKey(
        Test, related_name='options', on_delete=models.CASCADE,
        verbose_name=_('Test')
    )
    text = models.TextField(_('Text'), max_length=255)
    is_correct = models.BooleanField(_('Is correct'), default=False)

    def __str__(self):
        return f'Option: {self.text} (Correct: {self.is_correct})'


# Lesson Task
class Task(Content):
    lesson = models.ForeignKey(
        Lesson, related_name='tasks', on_delete=models.CASCADE,
        verbose_name=_('Lesson')
    )
    description = models.TextField(_('Description'))
    correct_answer = models.CharField(_('Correct answer'), max_length=255)

    class Meta:
        verbose_name = _('Task')
        verbose_name_plural = _('Tasks')

    def __str__(self):
        return f'Task: {self.description} (Lesson: {self.lesson})'
