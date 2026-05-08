from django.shortcuts import redirect
from django.conf import settings
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User
from .serializers import UserSerializer
from .uploads import upload_file


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


class AvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('avatar')
        if not file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > 5 * 1024 * 1024:
            return Response({'detail': 'File too large (max 5MB).'}, status=status.HTTP_400_BAD_REQUEST)
        allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if file.content_type not in allowed:
            return Response({'detail': 'Invalid file type.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            url = upload_file(file, prefix='avatars', content_type=file.content_type)
            request.user.avatar = url
            request.user.save(update_fields=['avatar'])
            return Response({'avatar': url})
        except Exception:
            return Response({'detail': 'Upload failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SessionImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > 10 * 1024 * 1024:
            return Response({'detail': 'File too large (max 10MB).'}, status=status.HTTP_400_BAD_REQUEST)
        allowed = ['image/jpeg', 'image/png', 'image/webp']
        if file.content_type not in allowed:
            return Response({'detail': 'Invalid file type.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            url = upload_file(file, prefix='sessions', content_type=file.content_type)
            return Response({'image': url})
        except Exception:
            return Response({'detail': 'Upload failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
