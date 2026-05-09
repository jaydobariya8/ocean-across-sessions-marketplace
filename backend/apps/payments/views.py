from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from apps.bookings.models import Booking
        booking_id = request.data.get('booking_id')
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        amount_cents = int(booking.amount_paid * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            metadata={'booking_id': booking.id, 'user_id': request.user.id},
        )
        booking.stripe_payment_id = intent.id
        booking.save(update_fields=['stripe_payment_id'])

        return Response({'client_secret': intent.client_secret})


class ConfirmPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from apps.bookings.models import Booking
        from .models import Payment
        booking_id = request.data.get('booking_id')
        payment_intent_id = request.data.get('payment_intent_id')

        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Intent must match what was stored during create-intent
        if booking.stripe_payment_id and booking.stripe_payment_id != payment_intent_id:
            return Response({'detail': 'Payment intent mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError:
            return Response({'detail': 'Invalid payment.'}, status=status.HTTP_400_BAD_REQUEST)

        if intent.status != 'succeeded':
            return Response({'detail': 'Payment not completed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate metadata ties intent to this booking
        meta_booking_id = intent.metadata.get('booking_id')
        if meta_booking_id and str(meta_booking_id) != str(booking.id):
            return Response({'detail': 'Payment intent mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = Booking.STATUS_CONFIRMED
        booking.stripe_payment_id = payment_intent_id
        booking.save(update_fields=['status', 'stripe_payment_id'])

        Payment.objects.update_or_create(
            stripe_payment_intent_id=payment_intent_id,
            defaults={
                'booking': booking,
                'amount': intent.amount / 100,
                'status': 'succeeded',
            }
        )
        return Response({'status': 'confirmed'})


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'payment_intent.succeeded':
            self._handle_payment_succeeded(event['data']['object'])

        return Response({'status': 'ok'})

    def _handle_payment_succeeded(self, payment_intent):
        from apps.bookings.models import Booking
        from .models import Payment
        booking_id = payment_intent['metadata'].get('booking_id')
        if not booking_id:
            return
        try:
            booking = Booking.objects.get(id=booking_id)
            booking.status = Booking.STATUS_CONFIRMED
            booking.save(update_fields=['status'])
            Payment.objects.update_or_create(
                stripe_payment_intent_id=payment_intent['id'],
                defaults={
                    'booking': booking,
                    'amount': payment_intent['amount'] / 100,
                    'status': 'succeeded',
                }
            )
        except Booking.DoesNotExist:
            pass
