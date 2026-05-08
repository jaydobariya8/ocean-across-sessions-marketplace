from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Session
from .serializers import SessionSerializer, SessionCreateSerializer
from apps.accounts.permissions import IsCreator, IsOwnerOrReadOnly


class SessionListCreateView(generics.ListCreateAPIView):
    queryset = Session.objects.select_related('creator').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['price', 'scheduled_at', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_creator):
            qs = qs.filter(status=Session.STATUS_PUBLISHED)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SessionCreateSerializer
        return SessionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsCreator()]
        return [IsAuthenticatedOrReadOnly()]


class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Session.objects.select_related('creator').all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return SessionCreateSerializer
        return SessionSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [IsAuthenticatedOrReadOnly()]


class CreatorSessionListView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsCreator]

    def get_queryset(self):
        return Session.objects.filter(creator=self.request.user).select_related('creator')
