from rest_framework import generics, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
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
        user = self.request.user
        if user.is_authenticated and user.is_creator:
            # Creators see published sessions + their own drafts/cancelled
            from django.db.models import Q
            qs = qs.filter(
                Q(status=Session.STATUS_PUBLISHED) | Q(creator=user)
            )
        else:
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

    def get_object(self):
        obj = super().get_object()
        # For reads: non-owners can only see published sessions
        if self.request.method in ('GET', 'HEAD'):
            user = self.request.user
            is_owner = user.is_authenticated and obj.creator_id == user.id
            if not is_owner and obj.status != Session.STATUS_PUBLISHED:
                raise PermissionDenied('Session is not publicly available.')
        return obj

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
