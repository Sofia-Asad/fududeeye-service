from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin
from apps.accounts.throttles import PasswordResetConfirmThrottle, PasswordResetRequestThrottle
from apps.core.middleware import get_current_ip
from apps.core.models import AuditLog

from .emails import send_password_reset_email
from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ResetPasswordSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()

GENERIC_RESET_MESSAGE = 'If an account exists with this email, a password reset link has been sent.'


def _log_auth_event(user, action):
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name='User',
        object_id=str(user.pk),
        object_repr=str(user),
        changes={},
        ip_address=get_current_ip(),
    )


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = None
    matched = User.objects.filter(email__iexact=email).first()
    if matched:
        # USERNAME_FIELD is still 'username' at the Django auth-backend level —
        # the API contract is email-only, but ModelBackend authenticates by username.
        user = authenticate(request, username=matched.username, password=password)

    if user is None or not user.is_active or not user.is_active_staff:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

    login(request, user)
    _log_auth_event(user, AuditLog.Action.LOGIN)
    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PasswordResetRequestThrottle])
def password_reset_request_view(request):
    """Always responds with the same generic message so the API never reveals
    whether an email address belongs to an account (prevents enumeration)."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']

    user = User.objects.filter(email__iexact=email, is_active=True, is_active_staff=True).first()
    if user is not None:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f'{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}'
        send_password_reset_email(user, reset_url)

    return Response({'detail': GENERIC_RESET_MESSAGE})


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PasswordResetConfirmThrottle])
def password_reset_confirm_view(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']

    user.set_password(serializer.validated_data['new_password'])
    user.save(update_fields=['password'])

    AuditLog.objects.create(
        user=user,
        action=AuditLog.Action.CUSTOM,
        model_name='User',
        object_id=str(user.pk),
        object_repr=str(user),
        changes={'password': 'reset via forgot-password link'},
        ip_address=get_current_ip(),
    )

    return Response({'detail': 'Password changed successfully.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    user = request.user
    _log_auth_event(user, AuditLog.Action.LOGOUT)
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    """Admin-only. No hard delete — deactivate via `is_active_staff` instead."""

    queryset = User.objects.all().order_by('username')
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['username', 'role']
    ordering = ['username']
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action == 'partial_update':
            return UserUpdateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        target = self.get_object()
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target.set_password(serializer.validated_data['new_password'])
        target.save(update_fields=['password'])

        # Password is excluded from the automatic audit diff — log this explicitly.
        AuditLog.objects.create(
            user=request.user,
            action=AuditLog.Action.CUSTOM,
            model_name='User',
            object_id=str(target.pk),
            object_repr=str(target),
            changes={'password': 'reset by admin'},
            ip_address=get_current_ip(),
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
