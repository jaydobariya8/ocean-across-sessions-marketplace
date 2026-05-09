from django.urls import path
from .views import CreatePaymentIntentView, ConfirmPaymentView, StripeWebhookView

urlpatterns = [
    path('create-intent/', CreatePaymentIntentView.as_view(), name='create_payment_intent'),
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='confirm_payment'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
]
