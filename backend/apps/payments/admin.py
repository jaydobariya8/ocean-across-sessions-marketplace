from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'stripe_payment_intent_id', 'amount', 'status', 'created_at']
    list_filter = ['status']
    readonly_fields = ['created_at', 'stripe_payment_intent_id']
