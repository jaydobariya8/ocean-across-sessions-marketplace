from django.shortcuts import redirect
from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User
from .serializers import UserSerializer


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class SwitchRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        if role not in [User.ROLE_USER, User.ROLE_CREATOR]:
            return Response({'detail': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.role = role
        request.user.save(update_fields=['role'])
        return Response({'role': role})


class OAuthCallbackView(APIView):
    """
    Called by social-django after successful OAuth.
    Reads JWT from session, redirects to frontend with tokens in URL params.
    Frontend extracts tokens, stores in cookies, redirects to dashboard.
    """
    permission_classes = []

    def get(self, request):
        access = request.session.pop('oauth_access', None)
        refresh = request.session.pop('oauth_refresh', None)

        if not access or not refresh:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_failed")

        frontend_url = f"{settings.FRONTEND_URL}/auth/callback"
        return redirect(f"{frontend_url}?access={access}&refresh={refresh}")
