from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'oauth_provider', 'is_active', 'date_joined']
    list_filter = ['role', 'oauth_provider', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {'fields': ('role', 'avatar', 'bio', 'oauth_provider')}),
    )
    search_fields = ['username', 'email']
