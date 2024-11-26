from django.db import models
from django.utils.translation import gettext_lazy as _


# Quiz
# ----------------------------------------------------------------------------------------------------------------------
class Quiz(models.Model):
    INTERFACE = (
        ('DEFAULT', _('Default')),
    )

    title = models.CharField(_('Title'), max_length=128)
    poster = models.ImageField(_('Poster'), upload_to='workspace/quiz/posters/', blank=True, null=True)
    description = models.TextField(_('Description'), blank=True, null=True)
    interface = models.CharField(
        _('Interface'), max_length=128,
        choices=INTERFACE, default='DEFAULT'
    )

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

    def __str__(self):
        return '#{} - {}'.format(self.pk, self.quiz)


# Option
class Option(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE,
        related_name='q_options', verbose_name=_('Question')
    )
    option_body = models.TextField(_('Option body'))
    is_correct = models.BooleanField(_('Is correct answer'), default=False)

    def __str__(self):
        return _('ID{} option belongs to ID{} question'.format(self.pk, self.question.pk))
