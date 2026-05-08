from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    scope = 'auth'


class BookingRateThrottle(UserRateThrottle):
    scope = 'booking'


class UploadRateThrottle(UserRateThrottle):
    scope = 'upload'
