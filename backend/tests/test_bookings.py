import pytest
from apps.bookings.models import Booking
from apps.sessions.models import Session


@pytest.mark.django_db
class TestBookingModel:
    def test_str_representation(self, booking, user, session):
        s = str(booking)
        assert user.username in s
        assert session.title in s

    def test_unique_booking_constraint(self, user, session):
        Booking.objects.create(user=user, session=session, amount_paid=session.price)
        with pytest.raises(Exception):
            Booking.objects.create(user=user, session=session, amount_paid=session.price)


@pytest.mark.django_db
class TestBookingListCreateView:
    def test_user_can_book_published_session(self, auth_client, session):
        res = auth_client.post('/api/bookings/', {'session_id': session.id})
        assert res.status_code == 201
        assert res.data['status'] == 'pending'

    def test_cannot_book_draft_session(self, auth_client, draft_session):
        res = auth_client.post('/api/bookings/', {'session_id': draft_session.id})
        assert res.status_code == 400

    def test_cannot_double_book(self, auth_client, session):
        auth_client.post('/api/bookings/', {'session_id': session.id})
        res = auth_client.post('/api/bookings/', {'session_id': session.id})
        assert res.status_code == 400

    def test_unauthenticated_cannot_book(self, api_client, session):
        res = api_client.post('/api/bookings/', {'session_id': session.id})
        assert res.status_code == 401

    def test_user_sees_own_bookings(self, auth_client, booking):
        res = auth_client.get('/api/bookings/')
        assert res.status_code == 200
        assert res.data['count'] == 1

    def test_filter_active_bookings(self, auth_client, booking):
        res = auth_client.get('/api/bookings/?status=active')
        assert res.status_code == 200
        assert res.data['count'] == 1

    def test_filter_past_bookings_empty(self, auth_client, booking):
        res = auth_client.get('/api/bookings/?status=past')
        assert res.status_code == 200
        assert res.data['count'] == 0

    def test_user_cannot_see_others_bookings(self, api_client, booking, another_creator):
        api_client.force_authenticate(user=another_creator)
        res = api_client.get('/api/bookings/')
        assert res.status_code == 200
        assert res.data['count'] == 0

    def test_booking_amount_set_from_session_price(self, auth_client, session):
        res = auth_client.post('/api/bookings/', {'session_id': session.id})
        assert res.status_code == 201
        b = Booking.objects.get(id=res.data['id'])
        assert str(b.amount_paid) == str(session.price)


@pytest.mark.django_db
class TestBookingDetailView:
    def test_user_can_cancel_confirmed_booking(self, auth_client, booking):
        res = auth_client.patch(f'/api/bookings/{booking.id}/', {'status': 'cancelled'})
        assert res.status_code == 200
        booking.refresh_from_db()
        assert booking.status == Booking.STATUS_CANCELLED

    def test_user_cannot_cancel_already_cancelled(self, auth_client, booking):
        booking.status = Booking.STATUS_CANCELLED
        booking.save()
        res = auth_client.patch(f'/api/bookings/{booking.id}/', {'status': 'cancelled'})
        assert res.status_code == 400

    def test_user_cannot_access_others_booking(self, api_client, booking, another_creator):
        api_client.force_authenticate(user=another_creator)
        res = api_client.get(f'/api/bookings/{booking.id}/')
        assert res.status_code == 404

    def test_booking_response_has_session_details(self, auth_client, booking):
        res = auth_client.get(f'/api/bookings/{booking.id}/')
        assert res.status_code == 200
        assert 'session' in res.data
        assert res.data['session']['title'] == booking.session.title


@pytest.mark.django_db
class TestCreatorBookingListView:
    def test_creator_sees_bookings_for_own_sessions(self, creator_client, booking):
        res = creator_client.get('/api/bookings/creator/')
        assert res.status_code == 200
        assert res.data['count'] == 1

    def test_creator_does_not_see_others_bookings(self, api_client, booking, another_creator):
        api_client.force_authenticate(user=another_creator)
        res = api_client.get('/api/bookings/creator/')
        assert res.status_code == 200
        assert res.data['count'] == 0

    def test_regular_user_forbidden(self, auth_client):
        res = auth_client.get('/api/bookings/creator/')
        assert res.status_code == 403


@pytest.mark.django_db
class TestSessionCapacity:
    def test_session_full_cannot_book(self, db, api_client, creator):
        from django.utils import timezone
        from datetime import timedelta
        s = Session.objects.create(
            creator=creator,
            title='Full Session',
            description='Only 1 spot',
            category='tech',
            price='10.00',
            duration_minutes=30,
            max_participants=1,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=Session.STATUS_PUBLISHED,
        )
        # first user books
        from apps.accounts.models import User
        u1 = User.objects.create_user(username='u1', email='u1@x.com', password='p')
        api_client.force_authenticate(user=u1)
        r1 = api_client.post('/api/bookings/', {'session_id': s.id})
        assert r1.status_code == 201

        # second user tries to book same full session
        u2 = User.objects.create_user(username='u2', email='u2@x.com', password='p')
        api_client.force_authenticate(user=u2)
        r2 = api_client.post('/api/bookings/', {'session_id': s.id})
        assert r2.status_code == 400
