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
