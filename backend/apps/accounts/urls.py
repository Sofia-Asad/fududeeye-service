from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import (
    UserViewSet,
    login_view,
    logout_view,
    me,
    password_reset_confirm_view,
    password_reset_request_view,
)

router = SimpleRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('me/', me, name='me'),
    path('auth/login/', login_view, name='auth-login'),
    path('auth/logout/', logout_view, name='auth-logout'),
    path('auth/password-reset/', password_reset_request_view, name='password-reset'),
    path('auth/password-reset-confirm/', password_reset_confirm_view, name='password-reset-confirm'),
    *router.urls,
]
