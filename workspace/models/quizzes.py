from django.db import models
from django.utils.translation import gettext_lazy as _


# Quiz
# ----------------------------------------------------------------------------------------------------------------------
class Quiz(models.Model):
    INTERFACE = (
        ('DEFAULT', _('Quizzes')),
        ('MAZE', _('Maze')),
    )

    title = models.CharField(_('Title'), max_length=128)
    poster = models.ImageField(_('Poster'), upload_to='workspace/quiz/posters/', blank=True, null=True)
    description = models.TextField(_('Description'), blank=True, null=True)
    interface = models.CharField(
        _('Interface'), max_length=128,
        choices=INTERFACE, default='DEFAULT'
    )
    max_score = models.PositiveSmallIntegerField(_('Max score'), default=0)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('Quiz')
        verbose_name_plural = _('Quizzes')


# Question
class Question(models.Model):
    QUESTION_TYPE = (
        ('SIMPLE', _('Simple')),
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE,
        related_name='quiz_questions', verbose_name=_('Quiz')
    )
    question_body = models.TextField(_('Question body'))
    question_type = models.CharField(
        _('Question type'), max_length=128,
        choices=QUESTION_TYPE, default='SIMPLE'
    )
    x_position = models.PositiveIntegerField(_('X'), blank=True, null=True)
    y_position = models.PositiveIntegerField(_('Y'), blank=True, null=True)

    def __str__(self):
        return '#{} - {}'.format(self.pk, self.quiz)

    class Meta:
        verbose_name = _('Question')
        verbose_name_plural = _('Questions')

# Option
class Option(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE,
        related_name='q_options', verbose_name=_('Question')
    )
    option_body = models.TextField(_('Option body'))
    is_correct = models.BooleanField(_('Is correct answer'), default=False)
    score = models.PositiveSmallIntegerField(_('Score'), default=0)

    def __str__(self):
        return 'ID{} option belongs to ID{} question'.format(self.pk, self.question.pk)

    class Meta:
        verbose_name = _('Option')
        verbose_name_plural = _('Options')