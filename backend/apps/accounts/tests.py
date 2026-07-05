import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.core.models import AuditLog

User = get_user_model()


@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username='admin_auth',
        password='pass12345',
        role='ADMIN',
        first_name='Admin',
    )


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(
        username='manager_auth',
        password='pass12345',
        role='MANAGER',
        first_name='Manager',
        email='manager_auth@fududeeye.local',
    )


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(
        username='sales_auth',
        password='pass12345',
        role='SALES',
        first_name='Sales',
    )


@pytest.mark.django_db
def test_login_returns_user_and_session_cookie(client, manager_user):
    resp = client.post('/api/v1/auth/login/', {
        'username': 'manager_auth',
        'password': 'pass12345',
    })
    assert resp.status_code == 200
    assert resp.data['username'] == 'manager_auth'
    assert resp.data['role'] == 'MANAGER'
    assert 'sessionid' in client.cookies
    assert AuditLog.objects.filter(user=manager_user, action=AuditLog.Action.LOGIN).exists()


@pytest.mark.django_db
def test_login_accepts_email_as_identifier(client, manager_user):
    resp = client.post('/api/v1/auth/login/', {
        'username': 'manager_auth@fududeeye.local',
        'password': 'pass12345',
    })
    assert resp.status_code == 200
    assert resp.data['username'] == 'manager_auth'


@pytest.mark.django_db
def test_login_rejects_unknown_email(client):
    resp = client.post('/api/v1/auth/login/', {
        'username': 'nobody@fududeeye.local',
        'password': 'pass12345',
    })
    assert resp.status_code == 400


@pytest.mark.django_db
def test_login_does_not_create_user_update_audit_for_last_login(client, manager_user):
    resp = client.post('/api/v1/auth/login/', {
        'username': 'manager_auth',
        'password': 'pass12345',
    })

    assert resp.status_code == 200
    assert not AuditLog.objects.filter(
        model_name='User',
        object_id=str(manager_user.pk),
        action=AuditLog.Action.UPDATE,
    ).exists()


@pytest.mark.django_db
def test_me_returns_current_user_after_login(client, manager_user):
    client.login(username='manager_auth', password='pass12345')
    resp = client.get('/api/v1/me/')
    assert resp.status_code == 200
    assert resp.data['id'] == manager_user.pk
    assert resp.data['can_view_finance'] is True


@pytest.mark.django_db
def test_logout_clears_session_and_logs_event(client, manager_user):
    client.login(username='manager_auth', password='pass12345')
    resp = client.post('/api/v1/auth/logout/')
    assert resp.status_code == 204
    assert AuditLog.objects.filter(user=manager_user, action=AuditLog.Action.LOGOUT).exists()

    me_resp = client.get('/api/v1/me/')
    assert me_resp.status_code in (401, 403)


@pytest.mark.django_db
def test_login_rejects_inactive_staff(client):
    User.objects.create_user(
        username='inactive_staff',
        password='pass12345',
        role='SALES',
        is_active_staff=False,
    )
    resp = client.post('/api/v1/auth/login/', {
        'username': 'inactive_staff',
        'password': 'pass12345',
    })
    assert resp.status_code == 400


@pytest.mark.django_db
def test_users_list_is_admin_only(client, admin_user, sales_user):
    client.force_authenticate(user=sales_user)
    sales_resp = client.get('/api/v1/users/')
    assert sales_resp.status_code == 403

    client.force_authenticate(user=admin_user)
    admin_resp = client.get('/api/v1/users/')
    assert admin_resp.status_code == 200
    usernames = [user['username'] for user in admin_resp.data['results']]
    assert 'admin_auth' in usernames
    assert 'sales_auth' in usernames


@pytest.mark.django_db
def test_user_role_change_is_audit_logged(sales_user):
    sales_user.role = User.Role.MANAGER
    sales_user.save(update_fields=['role'])

    log = AuditLog.objects.filter(
        model_name='User',
        object_id=str(sales_user.pk),
        action=AuditLog.Action.UPDATE,
    ).latest('timestamp')
    assert log.changes['role'] == {
        'old': User.Role.SALES,
        'new': User.Role.MANAGER,
    }


# ── user management (create / update / reset password) ─────────────────────────

@pytest.mark.django_db
def test_non_admin_cannot_create_user(client, sales_user):
    client.force_authenticate(user=sales_user)
    resp = client.post('/api/v1/users/', {
        'username': 'new_hire',
        'password': 'StrongPass123!',
        'role': 'SALES',
    })
    assert resp.status_code == 403


@pytest.mark.django_db
def test_admin_can_create_user(client, admin_user):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/users/', {
        'username': 'new_hire',
        'password': 'StrongPass123!',
        'first_name': 'New',
        'last_name': 'Hire',
        'email': 'new_hire@fududeeye.local',
        'role': 'SALES',
        'phone': '+252611119999',
    })
    assert resp.status_code == 201
    assert resp.data['username'] == 'new_hire'
    assert 'password' not in resp.data
    created = User.objects.get(username='new_hire')
    assert created.check_password('StrongPass123!')


@pytest.mark.django_db
def test_create_user_rejects_weak_password(client, admin_user):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/users/', {
        'username': 'weak_pw_user',
        'password': '123',
        'role': 'SALES',
    })
    assert resp.status_code == 400
    assert 'password' in resp.data


@pytest.mark.django_db
def test_admin_can_update_user_role_and_status(client, admin_user, sales_user):
    client.force_authenticate(user=admin_user)
    resp = client.patch(f'/api/v1/users/{sales_user.pk}/', {
        'role': 'MANAGER',
        'is_active_staff': False,
    })
    assert resp.status_code == 200
    sales_user.refresh_from_db()
    assert sales_user.role == 'MANAGER'
    assert sales_user.is_active_staff is False


@pytest.mark.django_db
def test_admin_can_reset_user_password(client, admin_user, sales_user):
    client.force_authenticate(user=admin_user)
    resp = client.post(f'/api/v1/users/{sales_user.pk}/reset-password/', {
        'new_password': 'BrandNewPass123!',
    })
    assert resp.status_code == 204
    sales_user.refresh_from_db()
    assert sales_user.check_password('BrandNewPass123!')

    log = AuditLog.objects.filter(
        model_name='User', object_id=str(sales_user.pk), action=AuditLog.Action.CUSTOM,
    ).latest('timestamp')
    assert log.user == admin_user
    assert 'BrandNewPass123' not in str(log.changes)


@pytest.mark.django_db
def test_reset_password_rejects_weak_password(client, admin_user, sales_user):
    client.force_authenticate(user=admin_user)
    resp = client.post(f'/api/v1/users/{sales_user.pk}/reset-password/', {
        'new_password': '123',
    })
    assert resp.status_code == 400


@pytest.mark.django_db
def test_non_admin_cannot_reset_password(client, manager_user, sales_user):
    client.force_authenticate(user=manager_user)
    resp = client.post(f'/api/v1/users/{sales_user.pk}/reset-password/', {
        'new_password': 'BrandNewPass123!',
    })
    assert resp.status_code == 403


@pytest.mark.django_db
def test_user_viewset_has_no_destroy(client, admin_user, sales_user):
    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/users/{sales_user.pk}/')
    assert resp.status_code == 405
    assert User.objects.filter(pk=sales_user.pk).exists()
