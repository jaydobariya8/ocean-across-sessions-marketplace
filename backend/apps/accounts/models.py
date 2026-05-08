from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_USER = 'user'
    ROLE_CREATOR = 'creator'
    ROLE_CHOICES = [(ROLE_USER, 'User'), (ROLE_CREATOR, 'Creator')]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_USER)
    avatar = models.URLField(blank=True, default='')
    bio = models.TextField(blank=True, default='')
    oauth_provider = models.CharField(max_length=20, blank=True, default='')

    class Meta:
        db_table = 'accounts_user'

    @property
    def is_creator(self):
        return self.role == self.ROLE_CREATOR

    def __str__(self):
        return f'{self.username} ({self.role})'
