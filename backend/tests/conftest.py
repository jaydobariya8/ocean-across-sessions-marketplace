import pytest
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.sessions.models import Session
from apps.bookings.models import Booking


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        email='user@test.com',
        password='pass123',
        role=User.ROLE_USER,
    )


@pytest.fixture
def creator(db):
    return User.objects.create_user(
        username='testcreator',
        email='creator@test.com',
        password='pass123',
        role=User.ROLE_CREATOR,
    )


@pytest.fixture
def another_creator(db):
    return User.objects.create_user(
        username='creator2',
        email='creator2@test.com',
        password='pass123',
        role=User.ROLE_CREATOR,
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def creator_client(api_client, creator):
    api_client.force_authenticate(user=creator)
    return api_client


@pytest.fixture
def session(db, creator):
    return Session.objects.create(
        creator=creator,
        title='Python Coaching',
        description='Learn Python from scratch',
        category='tech',
        price='99.99',
        duration_minutes=60,
        max_participants=5,
        scheduled_at=timezone.now() + timedelta(days=7),
        status=Session.STATUS_PUBLISHED,
    )


@pytest.fixture
def draft_session(db, creator):
    return Session.objects.create(
        creator=creator,
        title='Draft Session',
        description='Not yet published',
        category='coaching',
        price='50.00',
        duration_minutes=30,
        max_participants=3,
        scheduled_at=timezone.now() + timedelta(days=14),
        status=Session.STATUS_DRAFT,
    )


@pytest.fixture
def booking(db, user, session):
    return Booking.objects.create(
        user=user,
        session=session,
        status=Booking.STATUS_CONFIRMED,
        amount_paid=session.price,
    )
