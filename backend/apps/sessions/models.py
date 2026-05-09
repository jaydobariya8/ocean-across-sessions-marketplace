from django.db import models
from django.conf import settings


class Session(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_PUBLISHED, 'Published'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    CATEGORY_CHOICES = [
        ('coaching', 'Coaching'),
        ('tutoring', 'Tutoring'),
        ('fitness', 'Fitness'),
        ('wellness', 'Wellness'),
        ('business', 'Business'),
        ('tech', 'Technology'),
        ('music', 'Music'),
        ('art', 'Art'),
        ('other', 'Other'),
    ]

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='coaching')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(default=60)
    max_participants = models.PositiveIntegerField(default=1)
    scheduled_at = models.DateTimeField()
    image = models.URLField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sessions_session'
        ordering = ['-scheduled_at']

    @property
    def current_participants(self):
        return self.bookings.filter(status='confirmed').count()

    @property
    def is_available(self):
        return self.current_participants < self.max_participants

    def __str__(self):
        return f'{self.title} by {self.creator.username}'
