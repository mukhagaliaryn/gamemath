from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


# User
# ----------------------------------------------------------------------------------------------------------------------
class User(AbstractUser):
    avatar = models.ImageField(_('Қолданушы суреті'), upload_to='accounts/users/', blank=True, null=True)


    def __str__(self):
        return f'{self.first_name} {self.last_name}'
