from django.contrib.auth import authenticate, get_user_model, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin
from apps.core.middleware import get_current_ip
from apps.core.models import AuditLog

from .serializers import (
    LoginSerializer,
    ResetPasswordSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()


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
    identifier = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(request, username=identifier, password=password)
    if user is None and '@' in identifier:
        # Allow staff to sign in with their email too — look up the matching
        # username and retry, rather than requiring a second auth backend.
        matched = User.objects.filter(email__iexact=identifier).first()
        if matched:
            user = authenticate(request, username=matched.username, password=password)

    if user is None or not user.is_active or not user.is_active_staff:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

    login(request, user)
    _log_auth_event(user, AuditLog.Action.LOGIN)
    return Response(UserSerializer(user).data)


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
