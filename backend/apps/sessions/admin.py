from django.contrib import admin
from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'category', 'price', 'status', 'scheduled_at', 'current_participants']
    list_filter = ['status', 'category']
    search_fields = ['title', 'creator__username']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['status']
