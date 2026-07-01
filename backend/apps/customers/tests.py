import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Customer

User = get_user_model()


@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username='admin_test', password='pass', role='ADMIN'
    )


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(
        username='sales_test', password='pass', role='SALES'
    )


# --- creation ---

@pytest.mark.django_db
def test_create_customer(client, admin_user):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/customers/', {
        'full_name': 'Maryan Cali',
        'phone': '+252 61 111 0001',
    })
    assert resp.status_code == 201
    assert resp.data['full_name'] == 'Maryan Cali'
    assert resp.data['phone'] == '+252 61 111 0001'
    assert resp.data['is_active'] is True


@pytest.mark.django_db
def test_create_customer_requires_auth(client):
    resp = client.post('/api/v1/customers/', {'full_name': 'X', 'phone': '123'})
    assert resp.status_code == 403


# --- listing ---

@pytest.mark.django_db
def test_list_customers(client, admin_user):
    Customer.objects.create(full_name='Cabdi Nuur', phone='+252 61 000 0001')
    Customer.objects.create(full_name='Faadumo Aweys', phone='+252 61 000 0002')
    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/customers/')
    assert resp.status_code == 200
    assert resp.data['count'] >= 2


# --- business rule: phone search ---

@pytest.mark.django_db
def test_phone_search(client, admin_user):
    Customer.objects.create(full_name='Faadumo Aweys', phone='+252 61 999 1234')
    Customer.objects.create(full_name='Xasan Maxamed', phone='+252 61 888 0000')
    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/customers/?search=999')
    assert resp.status_code == 200
    names = [c['full_name'] for c in resp.data['results']]
    assert 'Faadumo Aweys' in names
    assert 'Xasan Maxamed' not in names


# --- business rule: is_active filter ---

@pytest.mark.django_db
def test_is_active_filter(client, admin_user):
    Customer.objects.create(full_name='Active One', phone='001', is_active=True)
    Customer.objects.create(full_name='Inactive One', phone='002', is_active=False)
    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/customers/?is_active=false')
    assert resp.status_code == 200
    names = [c['full_name'] for c in resp.data['results']]
    assert 'Inactive One' in names
    assert 'Active One' not in names


# --- business rule: sales role cannot hard-delete ---

@pytest.mark.django_db
def test_sales_user_cannot_delete(client, sales_user):
    c = Customer.objects.create(full_name='To Delete', phone='999')
    client.force_authenticate(user=sales_user)
    resp = client.delete(f'/api/v1/customers/{c.pk}/')
    assert resp.status_code == 403
