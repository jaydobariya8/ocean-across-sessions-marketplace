from django.urls import path
from .views import BookingListCreateView, BookingDetailView, CreatorBookingListView

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking_list'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    path('creator/', CreatorBookingListView.as_view(), name='creator_bookings'),
]
