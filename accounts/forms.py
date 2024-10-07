from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import User
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit


class UserForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'full_name', )

    def __init__(self, *args, **kwargs):
        super(UserForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_method = 'post'
        self.fields['username'].widget.attrs.update({'class': 'block w-full p-2.5 text-xl text-white bg-gray-50 rounded-lg border'})
        self.fields['email'].widget.attrs.update({'class': 'block w-full p-2.5 text-sm text-white bg-gray-50 rounded-lg border'})
        self.fields['full_name'].widget.attrs.update({'class': 'block w-full p-2.5 text-sm text-white bg-gray-50 rounded-lg border'})
        self.helper.add_input(Submit('submit', 'Create Account', css_class='btn-primary'))


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('email', 'full_name', )
