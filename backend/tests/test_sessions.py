import pytest
from django.utils import timezone
from datetime import timedelta
from apps.sessions.models import Session


@pytest.mark.django_db
class TestSessionModel:
    def test_current_participants_empty(self, session):
        assert session.current_participants == 0

    def test_is_available_when_empty(self, session):
        assert session.is_available is True

    def test_current_participants_counts_confirmed(self, session, booking):
        assert session.current_participants == 1

    def test_str_representation(self, session, creator):
        assert 'Python Coaching' in str(session)
        assert creator.username in str(session)


@pytest.mark.django_db
class TestSessionListView:
    def test_public_sees_only_published(self, api_client, session, draft_session):
        res = api_client.get('/api/sessions/')
        assert res.status_code == 200
        titles = [s['title'] for s in res.data['results']]
        assert 'Python Coaching' in titles
        assert 'Draft Session' not in titles

    def test_search_by_title(self, api_client, session):
        res = api_client.get('/api/sessions/?search=Python')
        assert res.status_code == 200
        assert res.data['count'] == 1
        assert res.data['results'][0]['title'] == 'Python Coaching'

    def test_search_no_match(self, api_client, session):
        res = api_client.get('/api/sessions/?search=ZZZNOMATCH')
        assert res.status_code == 200
        assert res.data['count'] == 0

    def test_filter_by_category(self, api_client, session):
        res = api_client.get('/api/sessions/?category=tech')
        assert res.status_code == 200
        assert res.data['count'] == 1

    def test_filter_category_no_match(self, api_client, session):
        res = api_client.get('/api/sessions/?category=music')
        assert res.status_code == 200
        assert res.data['count'] == 0

    def test_session_response_has_required_fields(self, api_client, session):
        res = api_client.get('/api/sessions/')
        s = res.data['results'][0]
        for field in ['id', 'title', 'price', 'creator', 'scheduled_at', 'status', 'current_participants']:
            assert field in s


@pytest.mark.django_db
class TestSessionCreateView:
    def test_creator_can_create(self, creator_client):
        payload = {
            'title': 'New Session',
            'description': 'Description',
            'category': 'tech',
            'price': '49.99',
            'duration_minutes': 45,
            'max_participants': 10,
            'scheduled_at': (timezone.now() + timedelta(days=3)).isoformat(),
            'status': 'published',
        }
        res = creator_client.post('/api/sessions/', payload)
        assert res.status_code == 201
        assert res.data['title'] == 'New Session'

    def test_user_cannot_create(self, auth_client):
        payload = {
            'title': 'Unauthorized',
            'description': 'Nope',
            'category': 'tech',
            'price': '10.00',
            'duration_minutes': 30,
            'max_participants': 1,
            'scheduled_at': (timezone.now() + timedelta(days=1)).isoformat(),
        }
        res = auth_client.post('/api/sessions/', payload)
        assert res.status_code == 403

    def test_unauthenticated_cannot_create(self, api_client):
        res = api_client.post('/api/sessions/', {'title': 'x'})
        assert res.status_code == 401


@pytest.mark.django_db
class TestSessionDetailView:
    def test_anyone_can_get_published(self, api_client, session):
        res = api_client.get(f'/api/sessions/{session.id}/')
        assert res.status_code == 200
        assert res.data['title'] == session.title

    def test_creator_can_update_own(self, creator_client, session):
        res = creator_client.patch(f'/api/sessions/{session.id}/', {'title': 'Updated'})
        assert res.status_code == 200
        session.refresh_from_db()
        assert session.title == 'Updated'

    def test_other_creator_cannot_update(self, api_client, session, another_creator):
        api_client.force_authenticate(user=another_creator)
        res = api_client.patch(f'/api/sessions/{session.id}/', {'title': 'Hacked'})
        assert res.status_code == 403

    def test_creator_can_delete_own(self, creator_client, session):
        res = creator_client.delete(f'/api/sessions/{session.id}/')
        assert res.status_code == 204
        assert not Session.objects.filter(id=session.id).exists()

    def test_user_cannot_delete(self, auth_client, session):
        res = auth_client.delete(f'/api/sessions/{session.id}/')
        assert res.status_code == 403

    def test_404_for_missing_session(self, api_client):
        res = api_client.get('/api/sessions/99999/')
        assert res.status_code == 404


@pytest.mark.django_db
class TestCreatorSessionListView:
    def test_creator_sees_own_sessions(self, creator_client, session, draft_session):
        res = creator_client.get('/api/sessions/my/')
        assert res.status_code == 200
        assert res.data['count'] == 2

    def test_user_cannot_access_creator_list(self, auth_client):
        res = auth_client.get('/api/sessions/my/')
        assert res.status_code == 403

    def test_creator_does_not_see_others_sessions(self, api_client, another_creator, session):
        api_client.force_authenticate(user=another_creator)
        res = api_client.get('/api/sessions/my/')
        assert res.status_code == 200
        assert res.data['count'] == 0
