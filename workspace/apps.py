from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class WorkspaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'workspace'
    verbose_name = _('Уоркспейс қосымшасы')
