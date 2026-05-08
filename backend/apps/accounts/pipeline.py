from rest_framework_simplejwt.tokens import RefreshToken


def save_avatar(backend, user, response, *args, **kwargs):
    if backend.name == 'github':
        avatar_url = response.get('avatar_url', '')
        user.oauth_provider = 'github'
    elif backend.name == 'google-oauth2':
        avatar_url = response.get('picture', '')
        user.oauth_provider = 'google'
    else:
        return

    if avatar_url and not user.avatar:
        user.avatar = avatar_url
    user.save()


def issue_jwt(backend, user, response, request=None, *args, **kwargs):
    """Store JWT tokens in session — picked up by OAuthCallbackView."""
    if user and request:
        refresh = RefreshToken.for_user(user)
        request.session['oauth_access'] = str(refresh.access_token)
        request.session['oauth_refresh'] = str(refresh)
