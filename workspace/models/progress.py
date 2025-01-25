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
        ('started', _('Басталды')),
        ('finished', _('Аяқталды')),
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='quiz_controls', verbose_name=_('Қолданушы')
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE,
        related_name='quiz_controls', verbose_name=_('Ойын тесті')
    )
    qr_code = models.ImageField('QR код', upload_to='workspace/qr_codes/', blank=True, null=True)
    status = models.CharField(_('Статус'), max_length=128, choices=STATUS, default='started')
    date_started = models.DateTimeField(_('Басталған уақыт'))
    date_finished = models.DateTimeField(_('Аяқталған уақыт'), blank=True, null=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

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
            self.qr_code.save(f'qr_code_{self.pk}.png', ContentFile(buffer.read()), save=False)
            super().save(update_fields=["qr_code"])


    def __str__(self):
        return 'Тест бақылау: {} - {}'.format(self.user, self.quiz)

    class Meta:
        verbose_name = _('Тест бақылау')
        verbose_name_plural = _('Тест бақылаулар')


# UserQuiz
class UserQuiz(models.Model):
    STATUS = (
        ('started', _('Басталды')),
        ('finished', _('Аяқталды')),
    )
    quiz_control = models.ForeignKey(
        QuizControl, on_delete=models.CASCADE,
        related_name='user_quizzes', verbose_name=_('Тест бақылау')
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE,
        related_name='user_quizzes', verbose_name=_('Ойын тесті')
    )
    username = models.CharField(_('Қолданушы аты-жөні'), max_length=128)
    session_id = models.UUIDField(_('Сессия ID'), default=uuid.uuid4, unique=True)
    total_score = models.PositiveSmallIntegerField(_('Жалпы балл'), default=0)
    status = models.CharField(_('Статус'), max_length=128, choices=STATUS, default='started')

    def __str__(self):
        return 'Тест бақылау: {} | Қолданушының тесті: {} - {}'.format(self.quiz_control, self.username, self.quiz)

    class Meta:
        verbose_name = _('Қолданушының тесті')
        verbose_name_plural = _('Қолданушылардың тесттері')



class UserAnswer(models.Model):
    user_quiz = models.ForeignKey(
        UserQuiz, on_delete=models.CASCADE,
        related_name='user_answers', verbose_name=_('Қолданушының тесті')
    )
    answers = models.ManyToManyField(Option, verbose_name=_('Жауаптар'))
    score = models.PositiveSmallIntegerField(_('Балл'), default=0)

    def __str__(self):
        return 'Қолданушының тесті: {} жауап ID:{}'.format(self.user_quiz, self.pk)

    class Meta:
        verbose_name = _('Қолданушының жауабы')
        verbose_name_plural = _('Қолданушылардың жауаптары')
