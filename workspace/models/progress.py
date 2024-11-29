from django.db import models
from accounts.models import User
from workspace.models import Option
from workspace.models.quizzes import Quiz
from django.utils.translation import gettext_lazy as _
from django.core.files.base import ContentFile
import qrcode
from io import BytesIO
import uuid


# QuizControl
# ----------------------------------------------------------------------------------------------------------------------
class QuizControl(models.Model):
    STATUS = (
        ('STARTED', _('Started')),
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
    qr_code = models.ImageField('QR Code', upload_to='workspaces/qr_codes/', blank=True, null=True)
    status = models.CharField(_('Status'), max_length=128, choices=STATUS, default='STARTED')
    date_started = models.DateTimeField(_('Date started'))
    date_finished = models.DateTimeField(_('Date finished'), blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.qr_code:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            link = f'https://gamesmath.pythonanywhere.com/quiz/control/{self.pk}/start/'
            qr.add_data(link)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            self.qr_code.save(f'qr_code_{self.id}.png', ContentFile(buffer.read()), save=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return 'Quiz control: {} - {}'.format(self.user, self.quiz)

    class Meta:
        verbose_name = _('QuizControl')
        verbose_name_plural = _('QuizControls')


# UserQuiz
class UserQuiz(models.Model):
    STATUS = (
        ('STARTED', _('Started')),
        ('FINISHED', _('Finished')),
    )
    quiz_control = models.ForeignKey(
        QuizControl, on_delete=models.CASCADE,
        related_name='qc_user_quizzes', verbose_name=_('QuizControl')
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE,
        related_name='q_user_quizzes', verbose_name=_('Quiz')
    )
    username = models.CharField(_('Username'), max_length=128)
    session_id = models.UUIDField(_('Session ID'), default=uuid.uuid4, unique=True)
    total_score = models.PositiveSmallIntegerField(_('Total score'), default=0)
    status = models.CharField(_('Status'), max_length=128, choices=STATUS, default='STARTED')

    def __str__(self):
        return 'Quiz control: {} | User quiz: {} - {}'.format(self.quiz_control, self.username, self.quiz)

    class Meta:
        verbose_name = _('UserQuiz')
        verbose_name_plural = _('UserQuizzes')



class UserAnswer(models.Model):
    user_quiz = models.ForeignKey(
        UserQuiz, on_delete=models.CASCADE,
        related_name='uq_answers', verbose_name=_('UserQuiz')
    )
    answers = models.ManyToManyField(Option, verbose_name=_('Answer'))
    score = models.PositiveSmallIntegerField(_('Score'), default=0)

    def __str__(self):
        return '{} answer {}'.format(self.user_quiz, self.pk)

    class Meta:
        verbose_name = _('UserAnswer')
        verbose_name_plural = _('UserAnswers')
