from django.db import models
from accounts.models import User
from workspace.models import Option
from workspace.models.quizzes import Quiz
from django.utils.translation import gettext_lazy as _


# QuizControl
# ----------------------------------------------------------------------------------------------------------------------
class QuizControl(models.Model):
    STATUS = (
        ('STARTED', _('Started')),
        ('PROCESS', _('Process')),
        ('FINISHED', _('Finished')),
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='u_quiz_controls', verbose_name=_('User')
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE,
        related_name='q_quiz_controls', verbose_name=_('Quiz')
    )
    status = models.BooleanField(_('Status'), max_length=128, choices=STATUS, default='STARTED')
    date_started = models.DateTimeField(_('Date started'))
    date_finished = models.DateTimeField(_('Date finished'))

    def __str__(self):
        return _('Quiz control: {} - {}'.format(self.user, self.quiz))

    class Meta:
        verbose_name = _('QuizControl')
        verbose_name_plural = _('QuizControls')


# UserQuiz
class UserQuiz(models.Model):
    quiz_control = models.ForeignKey(
        QuizControl, on_delete=models.CASCADE,
        related_name='qc_user_quizzes', verbose_name=_('QuizControl')
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE,
        related_name='q_user_quizzes', verbose_name=_('Quiz')
    )
    username = models.CharField(_('Username'), max_length=128)
    total_score = models.PositiveSmallIntegerField(_('Total score'), default=0)

    def __str__(self):
        return _('Quiz control: {} | User quiz: {} - {}'.format(self.quiz_control, self.username, self.quiz))

    class Meta:
        verbose_name = _('UserQuiz')
        verbose_name_plural = _('UserQuizzes')



class UserAnswer(models.Model):
    user_quiz = models.ForeignKey(
        UserQuiz, on_delete=models.CASCADE,
        related_name='uq_answers', verbose_name=_('UserQuiz')
    )
    answers = models.ManyToManyField(Option, verbose_name=_('Answer'))
    score = models.PositiveSmallIntegerField(_('Answer score'), default=0)

    def __str__(self):
        return _('{} answer {}'.format(self.user_quiz, self.pk))

    class Meta:
        verbose_name = _('UserAnswer')
        verbose_name_plural = _('UserAnswers')
