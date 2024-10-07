from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as UserModelAdmin
from django.contrib.auth.models import Group
from .models import User


class UserAdmin(UserModelAdmin):
    model = User
    list_display = ('email', 'username', 'full_name', 'is_staff', 'is_superuser', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active')
    search_fields = ('email', 'username', 'full_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('avatar', 'email', 'username', 'full_name', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'full_name', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
