import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
class TestOAuthCallbackView:
    def test_redirects_to_frontend_with_tokens(self, api_client, user):
        """Simulate post-OAuth state: tokens in session, GET callback view."""
        session = api_client.session
        refresh = RefreshToken.for_user(user)
        session['oauth_access'] = str(refresh.access_token)
        session['oauth_refresh'] = str(refresh)
        session.save()

        res = api_client.get('/api/auth/oauth/callback/')
        assert res.status_code == 302
        location = res['Location']
        assert 'access=' in location
        assert 'refresh=' in location
        assert '/auth/callback' in location

    def test_redirects_to_error_when_no_tokens_in_session(self, api_client):
        res = api_client.get('/api/auth/oauth/callback/')
        assert res.status_code == 302
        assert 'error=oauth_failed' in res['Location']

    def test_tokens_cleared_from_session_after_callback(self, api_client, user):
        session = api_client.session
        refresh = RefreshToken.for_user(user)
        session['oauth_access'] = str(refresh.access_token)
        session['oauth_refresh'] = str(refresh)
        session.save()

        api_client.get('/api/auth/oauth/callback/')

        # tokens should be popped — second call should fail
        res = api_client.get('/api/auth/oauth/callback/')
        assert res.status_code == 302
        assert 'error=oauth_failed' in res['Location']


@pytest.mark.django_db
class TestTokenRefresh:
    def test_valid_refresh_returns_new_access(self, api_client, user):
        refresh = RefreshToken.for_user(user)
        res = api_client.post('/api/auth/token/refresh/', {'refresh': str(refresh)})
        assert res.status_code == 200
        assert 'access' in res.data

    def test_invalid_refresh_rejected(self, api_client):
        res = api_client.post('/api/auth/token/refresh/', {'refresh': 'bad.token.here'})
        assert res.status_code == 401

    def test_missing_refresh_rejected(self, api_client):
        res = api_client.post('/api/auth/token/refresh/', {})
        assert res.status_code == 400


@pytest.mark.django_db
class TestJWTProtection:
    def test_valid_jwt_grants_access(self, api_client, user):
        refresh = RefreshToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        res = api_client.get('/api/auth/user/')
        assert res.status_code == 200

    def test_expired_jwt_rejected(self, api_client):
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalid.jwt.token')
        res = api_client.get('/api/auth/user/')
        assert res.status_code == 401

    def test_no_jwt_rejected_for_protected_route(self, api_client):
        res = api_client.get('/api/auth/user/')
        assert res.status_code == 401
