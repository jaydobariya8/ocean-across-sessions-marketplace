import pytest
from apps.accounts.models import User


@pytest.mark.django_db
class TestUserModel:
    def test_create_user_default_role_is_user(self):
        u = User.objects.create_user(username='a', email='a@x.com', password='p')
        assert u.role == User.ROLE_USER

    def test_is_creator_property(self, creator):
        assert creator.is_creator is True

    def test_is_creator_false_for_user(self, user):
        assert user.is_creator is False

    def test_str_representation(self, user):
        assert 'testuser' in str(user)
        assert 'user' in str(user)


@pytest.mark.django_db
class TestCurrentUserView:
    def test_get_profile_authenticated(self, auth_client, user):
        res = auth_client.get('/api/auth/user/')
        assert res.status_code == 200
        assert res.data['username'] == user.username
        assert res.data['email'] == user.email
        assert res.data['role'] == 'user'

    def test_get_profile_unauthenticated(self, api_client):
        res = api_client.get('/api/auth/user/')
        assert res.status_code == 401

    def test_update_profile_name(self, auth_client, user):
        res = auth_client.patch('/api/auth/user/', {'first_name': 'Jay', 'bio': 'Dev'})
        assert res.status_code == 200
        user.refresh_from_db()
        assert user.first_name == 'Jay'
        assert user.bio == 'Dev'

    def test_cannot_change_role_via_profile_update(self, auth_client, user):
        auth_client.patch('/api/auth/user/', {'role': 'creator'})
        user.refresh_from_db()
        assert user.role == User.ROLE_USER  # role is read-only

    def test_cannot_change_email_via_profile_update(self, auth_client, user):
        auth_client.patch('/api/auth/user/', {'email': 'hacker@x.com'})
        user.refresh_from_db()
        assert user.email == 'user@test.com'


@pytest.mark.django_db
class TestSwitchRoleView:
    def test_switch_to_creator(self, auth_client, user):
        res = auth_client.post('/api/auth/switch-role/', {'role': 'creator'})
        assert res.status_code == 200
        user.refresh_from_db()
        assert user.role == User.ROLE_CREATOR

    def test_switch_back_to_user(self, creator_client, creator):
        res = creator_client.post('/api/auth/switch-role/', {'role': 'user'})
        assert res.status_code == 200
        creator.refresh_from_db()
        assert creator.role == User.ROLE_USER

    def test_invalid_role_rejected(self, auth_client):
        res = auth_client.post('/api/auth/switch-role/', {'role': 'admin'})
        assert res.status_code == 400

    def test_unauthenticated_rejected(self, api_client):
        res = api_client.post('/api/auth/switch-role/', {'role': 'creator'})
        assert res.status_code == 401


@pytest.mark.django_db
class TestLogoutView:
    def test_logout_requires_auth(self, api_client):
        res = api_client.post('/api/auth/logout/', {'refresh': 'fake'})
        assert res.status_code == 401

    def test_logout_invalid_token(self, auth_client):
        res = auth_client.post('/api/auth/logout/', {'refresh': 'invalid-token'})
        assert res.status_code == 400
