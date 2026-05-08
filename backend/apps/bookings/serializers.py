from rest_framework import serializers
from .models import Booking
from apps.sessions.models import Session
from apps.sessions.serializers import SessionSerializer
from apps.accounts.serializers import UserPublicSerializer


class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    user = UserPublicSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
        source='session',
        write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'session', 'session_id',
            'status', 'stripe_payment_id', 'amount_paid', 'booked_at',
        ]
        read_only_fields = ['id', 'user', 'status', 'stripe_payment_id', 'amount_paid', 'booked_at']

    def validate(self, data):
        session = data['session']
        user = self.context['request'].user

        if session.status != 'published':
            raise serializers.ValidationError('Session is not available for booking.')

        if not session.is_available:
            raise serializers.ValidationError('Session is fully booked.')

        if Booking.objects.filter(user=user, session=session).exclude(
            status=Booking.STATUS_CANCELLED
        ).exists():
            raise serializers.ValidationError('You already booked this session.')

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['amount_paid'] = validated_data['session'].price
        return super().create(validated_data)


class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']
