from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session', 'status', 'amount_paid', 'booked_at']
    list_filter = ['status']
    search_fields = ['user__username', 'session__title']
    readonly_fields = ['booked_at', 'updated_at', 'stripe_payment_id']
