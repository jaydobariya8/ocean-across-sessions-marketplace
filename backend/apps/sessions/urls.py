from django.urls import path
from .views import SessionListCreateView, SessionDetailView, CreatorSessionListView

urlpatterns = [
    path('', SessionListCreateView.as_view(), name='session_list'),
    path('<int:pk>/', SessionDetailView.as_view(), name='session_detail'),
    path('my/', CreatorSessionListView.as_view(), name='creator_sessions'),
]
