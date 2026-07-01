import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from apps.customers.models import Customer
from .models import Category, Item

User = get_user_model()


# ── fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='admin_inv', password='pass', role='ADMIN')


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username='mgr_inv', password='pass', role='MANAGER')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='sales_inv', password='pass', role='SALES')


@pytest.fixture
def category(db):
    return Category.objects.create(name='Electronics', kind=Category.Kind.ELECTRONICS)


@pytest.fixture
def consignment_owner(db):
    return Customer.objects.create(full_name='Axmed Farah', phone='+252 61 100 0001')


# ── helpers ───────────────────────────────────────────────────────────────────

def company_payload(category):
    return {
        'title': 'Company Laptop',
        'category': category.pk,
        'owner_type': 'COMPANY',
        'cost_price': '500.00',
        'listed_price': '750.00',
    }


def consignment_payload(category, owner):
    return {
        'title': 'Consignment Phone',
        'category': category.pk,
        'owner_type': 'CONSIGNMENT',
        'owner': owner.pk,
        'owner_asking_price': '200.00',
        'listed_price': '280.00',
    }


# ── ownership rule: CONSIGNMENT ───────────────────────────────────────────────

@pytest.mark.django_db
def test_consignment_without_owner_rejected(client, admin_user, category):
    """CONSIGNMENT item missing owner must return 400."""
    client.force_authenticate(user=admin_user)
    payload = {
        'title': 'Bad Consignment',
        'category': category.pk,
        'owner_type': 'CONSIGNMENT',
        'owner_asking_price': '100.00',
        'listed_price': '150.00',
    }
    resp = client.post('/api/v1/items/', payload)
    assert resp.status_code == 400
    assert 'owner' in resp.data


@pytest.mark.django_db
def test_consignment_without_asking_price_rejected(client, admin_user, category, consignment_owner):
    """CONSIGNMENT item missing owner_asking_price must return 400."""
    client.force_authenticate(user=admin_user)
    payload = {
        'title': 'Bad Consignment',
        'category': category.pk,
        'owner_type': 'CONSIGNMENT',
        'owner': consignment_owner.pk,
        'listed_price': '150.00',
    }
    resp = client.post('/api/v1/items/', payload)
    assert resp.status_code == 400
    assert 'owner_asking_price' in resp.data


@pytest.mark.django_db
def test_consignment_with_cost_price_rejected(client, admin_user, category, consignment_owner):
    """CONSIGNMENT item with cost_price set must return 400."""
    client.force_authenticate(user=admin_user)
    payload = {
        'title': 'Bad Consignment',
        'category': category.pk,
        'owner_type': 'CONSIGNMENT',
        'owner': consignment_owner.pk,
        'owner_asking_price': '200.00',
        'cost_price': '180.00',
        'listed_price': '280.00',
    }
    resp = client.post('/api/v1/items/', payload)
    assert resp.status_code == 400
    assert 'cost_price' in resp.data


# ── ownership rule: COMPANY ───────────────────────────────────────────────────

@pytest.mark.django_db
def test_company_with_owner_rejected(client, admin_user, category, consignment_owner):
    """COMPANY item with an owner FK must return 400."""
    client.force_authenticate(user=admin_user)
    payload = {
        'title': 'Bad Company',
        'category': category.pk,
        'owner_type': 'COMPANY',
        'owner': consignment_owner.pk,
        'cost_price': '500.00',
        'listed_price': '750.00',
    }
    resp = client.post('/api/v1/items/', payload)
    assert resp.status_code == 400
    assert 'owner' in resp.data


@pytest.mark.django_db
def test_company_without_cost_price_rejected(client, admin_user, category):
    """COMPANY item missing cost_price must return 400."""
    client.force_authenticate(user=admin_user)
    payload = {
        'title': 'Bad Company',
        'category': category.pk,
        'owner_type': 'COMPANY',
        'listed_price': '750.00',
    }
    resp = client.post('/api/v1/items/', payload)
    assert resp.status_code == 400
    assert 'cost_price' in resp.data


@pytest.mark.django_db
def test_company_with_asking_price_rejected(client, admin_user, category):
    """COMPANY item with owner_asking_price set must return 400."""
    client.force_authenticate(user=admin_user)
    payload = {
        'title': 'Bad Company',
        'category': category.pk,
        'owner_type': 'COMPANY',
        'cost_price': '500.00',
        'owner_asking_price': '400.00',
        'listed_price': '750.00',
    }
    resp = client.post('/api/v1/items/', payload)
    assert resp.status_code == 400
    assert 'owner_asking_price' in resp.data


# ── happy path ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_valid_company_item(client, admin_user, category):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/items/', company_payload(category))
    assert resp.status_code == 201
    assert resp.data['title'] == 'Company Laptop'
    assert resp.data['owner_type'] == 'COMPANY'
    assert resp.data['owner'] is None


@pytest.mark.django_db
def test_create_valid_consignment_item(client, admin_user, category, consignment_owner):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/items/', consignment_payload(category, consignment_owner))
    assert resp.status_code == 201
    assert resp.data['owner'] == consignment_owner.pk
    assert resp.data['owner_asking_price'] == '200.00'


# ── model properties ──────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_quantity_available(category, consignment_owner):
    item = Item(
        title='Test', category=category,
        owner_type=Item.OwnerType.CONSIGNMENT,
        owner=consignment_owner,
        owner_asking_price=Decimal('100.00'),
        listed_price=Decimal('150.00'),
        quantity=5, quantity_sold=2,
    )
    assert item.quantity_available == 3


@pytest.mark.django_db
def test_expected_profit_consignment(category, consignment_owner):
    item = Item(
        title='Test', category=category,
        owner_type=Item.OwnerType.CONSIGNMENT,
        owner=consignment_owner,
        owner_asking_price=Decimal('200.00'),
        listed_price=Decimal('280.00'),
    )
    assert item.expected_profit_per_unit == Decimal('80.00')


@pytest.mark.django_db
def test_expected_profit_company(category):
    item = Item(
        title='Test', category=category,
        owner_type=Item.OwnerType.COMPANY,
        cost_price=Decimal('500.00'),
        listed_price=Decimal('750.00'),
    )
    assert item.expected_profit_per_unit == Decimal('250.00')


# ── model clean() — direct ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_model_clean_rejects_consignment_without_owner(category):
    item = Item(
        title='X', category=category,
        owner_type=Item.OwnerType.CONSIGNMENT,
        owner_asking_price=Decimal('100.00'),
        listed_price=Decimal('150.00'),
    )
    with pytest.raises(ValidationError) as exc_info:
        item.clean()
    assert 'owner' in exc_info.value.message_dict


# ── API filters ───────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_items(client, admin_user):
    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/items/')
    assert resp.status_code == 200


@pytest.mark.django_db
def test_filter_by_owner_type(client, admin_user, category, consignment_owner):
    client.force_authenticate(user=admin_user)
    client.post('/api/v1/items/', company_payload(category))
    client.post('/api/v1/items/', consignment_payload(category, consignment_owner))

    resp = client.get('/api/v1/items/?owner_type=COMPANY')
    assert resp.status_code == 200
    types = [i['owner_type'] for i in resp.data['results']]
    assert all(t == 'COMPANY' for t in types)
    assert 'CONSIGNMENT' not in types


@pytest.mark.django_db
def test_filter_by_status(client, admin_user, category):
    client.force_authenticate(user=admin_user)
    resp_create = client.post('/api/v1/items/', company_payload(category))
    assert resp_create.status_code == 201

    resp = client.get('/api/v1/items/?status=ACTIVE')
    assert resp.status_code == 200
    statuses = [i['status'] for i in resp.data['results']]
    assert 'DRAFT' not in statuses


# ── category endpoint ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_category_list(client, admin_user, category):
    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/categories/')
    assert resp.status_code == 200
    names = [c['name'] for c in resp.data['results']]
    assert 'Electronics' in names


@pytest.mark.django_db
def test_category_create_by_manager(client, manager_user):
    client.force_authenticate(user=manager_user)
    resp = client.post('/api/v1/categories/', {'name': 'Vehicles', 'kind': 'VEHICLE'})
    assert resp.status_code == 201


@pytest.mark.django_db
def test_sales_user_cannot_delete_item(client, sales_user, category):
    """SALES role must be denied hard-delete on items."""
    admin = User.objects.create_user(username='tmp_admin', password='pass', role='ADMIN')
    c = APIClient()
    c.default_format = 'json'
    c.force_authenticate(user=admin)
    resp = c.post('/api/v1/items/', company_payload(category))
    assert resp.status_code == 201
    item_pk = resp.data['id']

    client.force_authenticate(user=sales_user)
    resp = client.delete(f'/api/v1/items/{item_pk}/')
    assert resp.status_code == 403
