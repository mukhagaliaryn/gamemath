from django.db import models
from django.utils.translation import gettext_lazy as _


# GameType
class Category(models.Model):
    name = models.CharField(_('Атауы'), max_length=128)
    slug = models.SlugField(_('Кілттік сөз'), max_length=128, unique=True)
    order = models.PositiveSmallIntegerField(_('Реттілік номері'), default=0)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Категория')
        verbose_name_plural = _('Категориялар')
        ordering = ('order', )


# GameType
class Interface(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='interfaces', verbose_name=_('Категория'), null=True, blank=True

    )
    name = models.CharField(_('Атауы'), max_length=128)
    slug = models.SlugField(_('Кілттік сөз'), max_length=128, unique=True)
    order = models.PositiveSmallIntegerField(_('Реттілік номері'), default=0)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Интерфейс')
        verbose_name_plural = _('Интерфейстер')
        ordering = ('order', )


# Quiz
# ----------------------------------------------------------------------------------------------------------------------
class Quiz(models.Model):
    title = models.CharField(_('Тақырыбы'), max_length=128)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='quizzes', verbose_name=_('Категория'),

    )
    interface = models.ForeignKey(
        Interface, on_delete=models.CASCADE,
        related_name='quizzes', verbose_name=_('Интерфейс'),

    )
    poster = models.ImageField(_('Постер'), upload_to='workspace/quiz/posters/', blank=True, null=True)
    description = models.TextField(_('Анықтамасы'), blank=True, null=True)
    max_score = models.PositiveSmallIntegerField(_('Макс. балл'), default=0)
    order = models.PositiveSmallIntegerField(_('Реттілік номері'), default=0)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('Ойын тесті')
        verbose_name_plural = _('Ойын тесттері')
        ordering = ('order', )


# Question
class Question(models.Model):
    QUESTION_TYPE = (
        ('simple', _('Бір жауапты')),
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE,
        related_name='questions', verbose_name=_('Ойын тесті')
    )
    question_body = models.TextField(_('Берілген сұрақ'))
    question_type = models.CharField(
        _('Сұрақ түрі'), max_length=128,
        choices=QUESTION_TYPE, default='simple'
    )
    order = models.PositiveSmallIntegerField(_('Реттілік номері'), default=0)

    def __str__(self):
        return '{}: {} - сұрақ'.format(self.quiz.title, self.order)

    class Meta:
        verbose_name = _('Сұрақ')
        verbose_name_plural = _('Сұрақтар')
        ordering = ('order', )


# Option
class Option(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE,
        related_name='options', verbose_name=_('Сұрақ')
    )
    option_body = models.TextField(_('Нұсқаның мәтіні'))
    is_correct = models.BooleanField(_('Дұрыс жауап'), default=False)
    score = models.PositiveSmallIntegerField(_('Балл'), default=0)

    def __str__(self):
        return 'ID{} нұсқа жауабы ID{} сұрағына тиесілі'.format(self.pk, self.question.pk)

    class Meta:
        verbose_name = _('Нұсқа жауабы')
        verbose_name_plural = _('Нұсқа жауаптары')
