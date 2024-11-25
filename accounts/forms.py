from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import User
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit


class UserForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'full_name', 'account_type', )


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('email', 'full_name', )
