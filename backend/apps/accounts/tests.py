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
