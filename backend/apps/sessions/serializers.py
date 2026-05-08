from rest_framework import serializers
from .models import Session
from apps.accounts.serializers import UserPublicSerializer


class SessionSerializer(serializers.ModelSerializer):
    creator = UserPublicSerializer(read_only=True)
    current_participants = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()

    class Meta:
        model = Session
        fields = [
            'id', 'creator', 'title', 'description', 'category',
            'price', 'duration_minutes', 'max_participants',
            'current_participants', 'is_available',
            'scheduled_at', 'image', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'creator', 'created_at']


class SessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = [
            'id', 'title', 'description', 'category',
            'price', 'duration_minutes', 'max_participants',
            'scheduled_at', 'image', 'status',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)
