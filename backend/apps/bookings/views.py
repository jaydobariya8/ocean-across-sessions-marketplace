from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer, BookingStatusSerializer
from apps.accounts.permissions import IsCreator


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Booking.objects.select_related('session', 'session__creator', 'user')
        status_filter = self.request.query_params.get('status')
        if status_filter == 'active':
            return qs.filter(user=self.request.user, status__in=['pending', 'confirmed'])
        elif status_filter == 'past':
            return qs.filter(user=self.request.user, status__in=['completed', 'cancelled'])
        return qs.filter(user=self.request.user)


class BookingDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BookingStatusSerializer
        return BookingSerializer

    def partial_update(self, request, *args, **kwargs):
        booking = self.get_object()
        new_status = request.data.get('status')
        if new_status == Booking.STATUS_CANCELLED and booking.status not in ['confirmed', 'pending']:
            return Response(
                {'detail': 'Cannot cancel this booking.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().partial_update(request, *args, **kwargs)


class CreatorBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsCreator]

    def get_queryset(self):
        return Booking.objects.filter(
            session__creator=self.request.user
        ).select_related('session', 'user')
