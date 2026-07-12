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
        username='admin_test', password='pass', role='ADMIN', email='admin_test@fududeeye.local'
    )


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(
        username='sales_test', password='pass', role='SALES', email='sales_test@fududeeye.local'
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


@pytest.mark.django_db
def test_admin_can_delete_customer_with_no_history(client, admin_user):
    c = Customer.objects.create(full_name='No History', phone='888')
    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/customers/{c.pk}/')
    assert resp.status_code == 204
    assert not Customer.objects.filter(pk=c.pk).exists()


@pytest.mark.django_db
def test_admin_cannot_delete_customer_with_related_records(client, admin_user):
    from apps.demands.models import Demand

    c = Customer.objects.create(full_name='Has Demand', phone='777')
    Demand.objects.create(customer=c, title='Wants a laptop')

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/customers/{c.pk}/')

    assert resp.status_code == 400
    assert 'cannot be deleted' in resp.data['detail']
    assert Customer.objects.filter(pk=c.pk).exists()


# --- business rule: edit permissions ---

@pytest.mark.django_db
def test_admin_can_edit_any_customer(client, admin_user):
    c = Customer.objects.create(full_name='Original Name', phone='001')
    client.force_authenticate(user=admin_user)
    resp = client.patch(f'/api/v1/customers/{c.pk}/', {'full_name': 'Updated Name'})
    assert resp.status_code == 200
    assert resp.data['full_name'] == 'Updated Name'


@pytest.mark.django_db
def test_sales_user_can_edit_own_customer(client, sales_user):
    c = Customer.objects.create(full_name='Owned Customer', phone='555', created_by=sales_user)
    client.force_authenticate(user=sales_user)

    resp = client.patch(f'/api/v1/customers/{c.pk}/', {'full_name': 'Renamed Owned Customer'})
    assert resp.status_code == 200
    assert resp.data['full_name'] == 'Renamed Owned Customer'


@pytest.mark.django_db
def test_sales_user_cannot_edit_others_customer(client, admin_user, sales_user):
    client.force_authenticate(user=admin_user)
    create_resp = client.post('/api/v1/customers/', {'full_name': 'Admin Created', 'phone': '777'})
    customer_id = create_resp.data['id']

    client.force_authenticate(user=sales_user)
    resp = client.patch(f'/api/v1/customers/{customer_id}/', {'full_name': 'Hijacked'})
    assert resp.status_code == 403


# --- business rule: duplicate phone prevention ---

@pytest.mark.django_db
def test_create_customer_with_unique_phone_succeeds(client, admin_user):
    Customer.objects.create(full_name='Existing', phone='0611111111')
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/customers/', {'full_name': 'New Customer', 'phone': '0622222222'})
    assert resp.status_code == 201


@pytest.mark.django_db
def test_create_customer_with_exact_duplicate_phone_rejected(client, admin_user):
    Customer.objects.create(full_name='Existing', phone='0612345678')
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/customers/', {'full_name': 'Duplicate', 'phone': '0612345678'})
    assert resp.status_code == 400
    assert resp.data['phone'] == ['A customer with this phone number already exists.']


@pytest.mark.parametrize('variant', ['061 234 5678', '061-234-5678', '0612345678'])
@pytest.mark.django_db
def test_create_customer_with_reformatted_duplicate_phone_rejected(client, admin_user, variant):
    Customer.objects.create(full_name='Existing', phone='0612345678')
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/customers/', {'full_name': 'Duplicate', 'phone': variant})
    assert resp.status_code == 400
    assert resp.data['phone'] == ['A customer with this phone number already exists.']


@pytest.mark.django_db
def test_edit_customer_without_changing_phone_succeeds(client, admin_user):
    c = Customer.objects.create(full_name='Original Name', phone='0613334444')
    client.force_authenticate(user=admin_user)
    resp = client.patch(f'/api/v1/customers/{c.pk}/', {'full_name': 'Renamed', 'phone': '0613334444'})
    assert resp.status_code == 200
    assert resp.data['full_name'] == 'Renamed'


@pytest.mark.django_db
def test_edit_customer_keeping_own_legacy_duplicate_phone_succeeds(client, admin_user):
    """Two pre-existing records may already share a phone (data from before this
    rule existed). Editing one of them without touching phone must still work —
    it shouldn't get locked out just because another record shares its number."""
    a = Customer.objects.create(full_name='Legacy A', phone='0619998888')
    Customer.objects.create(full_name='Legacy B', phone='0619998888')
    client.force_authenticate(user=admin_user)
    resp = client.patch(f'/api/v1/customers/{a.pk}/', {'full_name': 'Legacy A Renamed', 'phone': '0619998888'})
    assert resp.status_code == 200
    assert resp.data['full_name'] == 'Legacy A Renamed'


@pytest.mark.django_db
def test_edit_customer_phone_to_another_customers_phone_rejected(client, admin_user):
    Customer.objects.create(full_name='Customer B', phone='0615556666')
    a = Customer.objects.create(full_name='Customer A', phone='0617778888')
    client.force_authenticate(user=admin_user)
    resp = client.patch(f'/api/v1/customers/{a.pk}/', {'phone': '0615556666'})
    assert resp.status_code == 400
    assert resp.data['phone'] == ['A customer with this phone number already exists.']
    a.refresh_from_db()
    assert a.phone == '0617778888'
