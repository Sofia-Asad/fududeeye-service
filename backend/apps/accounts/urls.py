from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import UserViewSet, login_view, logout_view, me

router = SimpleRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('me/', me, name='me'),
    path('auth/login/', login_view, name='auth-login'),
    path('auth/logout/', logout_view, name='auth-logout'),
    *router.urls,
]
