from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Grants access only to users with the ADMIN role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )


class IsManagerOrAbove(BasePermission):
    """Grants access to ADMIN and MANAGER roles."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('ADMIN', 'MANAGER')
        )


class IsFinanceViewer(BasePermission):
    """Grants read access to finance data (ADMIN + MANAGER)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.can_view_finance
        )


class IsStaffEditOwn(BasePermission):
    """Any authenticated user can read; SALES staff may only edit their own records."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role in ('ADMIN', 'MANAGER'):
            return True
        owner = getattr(obj, 'handled_by', None) or getattr(obj, 'created_by', None)
        return owner == request.user


class DenyDeleteUnlessAdmin(BasePermission):
    """Block HTTP DELETE for non-admin users."""

    def has_permission(self, request, view):
        if request.method == 'DELETE':
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.is_admin
            )
        return True
