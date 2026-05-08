from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CurrentUserView, LogoutView, SwitchRoleView, OAuthCallbackView, AvatarUploadView, SessionImageUploadView

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', CurrentUserView.as_view(), name='current_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('switch-role/', SwitchRoleView.as_view(), name='switch_role'),
    path('oauth/callback/', OAuthCallbackView.as_view(), name='oauth_callback'),
    path('upload/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    path('upload/session-image/', SessionImageUploadView.as_view(), name='session_image_upload'),
]
