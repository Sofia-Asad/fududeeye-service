import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.inventory.models import Category, Item

from .models import Inquiry
from .throttles import InquiryCreateThrottle

User = get_user_model()


@pytest.fixture(autouse=True)
def reset_throttle_cache():
    """DRF's AnonRateThrottle counts requests in Django's cache, which isn't
    rolled back between tests — without this, the many anonymous inquiry-create
    tests in this file would exhaust each other's throttle budget by test order."""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='admin_mkt', password='pass', role='ADMIN', email='admin_mkt@fududeeye.local')


@pytest.fixture
def category(db):
    return Category.objects.create(name='Electronics', kind=Category.Kind.ELECTRONICS)


@pytest.fixture
def active_item(db, category):
    return Item.objects.create(
        title='iPhone 12 Pro Max',
        category=category,
        owner_type=Item.OwnerType.COMPANY,
        cost_price='500.00',
        listed_price='750.00',
        status=Item.Status.ACTIVE,
    )


@pytest.fixture
def draft_item(db, category):
    return Item.objects.create(
        title='Unpublished Laptop',
        category=category,
        owner_type=Item.OwnerType.COMPANY,
        cost_price='400.00',
        listed_price='600.00',
        status=Item.Status.DRAFT,
    )


# ── public browsing ────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_public_items_list_requires_no_auth(client, active_item):
    response = client.get('/api/v1/public/items/')
    assert response.status_code == 200
    assert any(row['id'] == active_item.pk for row in response.data['results'])


@pytest.mark.django_db
def test_public_items_list_excludes_non_active(client, active_item, draft_item):
    response = client.get('/api/v1/public/items/')
    ids = [row['id'] for row in response.data['results']]
    assert active_item.pk in ids
    assert draft_item.pk not in ids


@pytest.mark.django_db
def test_public_item_serializer_hides_internal_pricing(client, active_item):
    response = client.get(f'/api/v1/public/items/{active_item.pk}/')
    assert response.status_code == 200
    assert 'cost_price' not in response.data
    assert 'owner_asking_price' not in response.data
    assert 'owner' not in response.data
    assert response.data['listed_price'] == '750.00'


@pytest.mark.django_db
def test_public_item_detail_hides_draft_item(client, draft_item):
    response = client.get(f'/api/v1/public/items/{draft_item.pk}/')
    assert response.status_code == 404


@pytest.mark.django_db
def test_public_categories_list_requires_no_auth(client, category):
    response = client.get('/api/v1/public/categories/')
    assert response.status_code == 200
    assert any(row['id'] == category.pk for row in response.data['results'])


@pytest.mark.django_db
def test_public_category_active_item_count(client, category, active_item, draft_item):
    response = client.get('/api/v1/public/categories/')
    row = next(row for row in response.data['results'] if row['id'] == category.pk)
    assert row['active_item_count'] == 1


@pytest.mark.django_db
def test_public_items_price_range_filter(client, category):
    cheap = Item.objects.create(
        title='Cheap Radio', category=category, owner_type=Item.OwnerType.COMPANY,
        cost_price='10.00', listed_price='20.00', status=Item.Status.ACTIVE,
    )
    pricey = Item.objects.create(
        title='Pricey Laptop', category=category, owner_type=Item.OwnerType.COMPANY,
        cost_price='900.00', listed_price='1200.00', status=Item.Status.ACTIVE,
    )

    response = client.get('/api/v1/public/items/', {'price_min': '15', 'price_max': '100'})
    ids = [row['id'] for row in response.data['results']]
    assert cheap.pk in ids
    assert pricey.pk not in ids


# ── inquiry creation (anonymous) ───────────────────────────────────────────────

@pytest.mark.django_db
def test_item_interest_inquiry_created_anonymously(client, active_item):
    response = client.post('/api/v1/inquiries/', {
        'kind': 'ITEM_INTEREST',
        'full_name': 'Amina Hassan',
        'phone': '+252618000001',
        'item': active_item.pk,
    })
    assert response.status_code == 201
    assert Inquiry.objects.count() == 1
    assert Inquiry.objects.get().item_id == active_item.pk


@pytest.mark.django_db
def test_item_interest_inquiry_requires_item(client):
    response = client.post('/api/v1/inquiries/', {
        'kind': 'ITEM_INTEREST',
        'full_name': 'Amina Hassan',
        'phone': '+252618000001',
    })
    assert response.status_code == 400


@pytest.mark.django_db
def test_item_interest_inquiry_rejects_inactive_item(client, draft_item):
    response = client.post('/api/v1/inquiries/', {
        'kind': 'ITEM_INTEREST',
        'full_name': 'Amina Hassan',
        'phone': '+252618000001',
        'item': draft_item.pk,
    })
    assert response.status_code == 400


@pytest.mark.django_db
def test_item_request_inquiry_created_anonymously(client, category):
    response = client.post('/api/v1/inquiries/', {
        'kind': 'ITEM_REQUEST',
        'full_name': 'Yusuf Ali',
        'phone': '+252618000002',
        'category': category.pk,
        'item_needed': '55-inch TV',
        'message': 'Looking for something under $400.',
    })
    assert response.status_code == 201
    assert Inquiry.objects.get().status == Inquiry.Status.NEW


@pytest.mark.django_db
def test_item_request_inquiry_requires_item_needed(client, category):
    response = client.post('/api/v1/inquiries/', {
        'kind': 'ITEM_REQUEST',
        'full_name': 'Yusuf Ali',
        'phone': '+252618000002',
        'category': category.pk,
    })
    assert response.status_code == 400


# ── staff management ───────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_anonymous_cannot_list_inquiries(client, active_item):
    Inquiry.objects.create(kind=Inquiry.Kind.ITEM_INTEREST, full_name='A', phone='1', item=active_item)
    response = client.get('/api/v1/inquiries/')
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_staff_can_list_and_update_inquiry_status(client, admin_user, active_item):
    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_INTEREST, full_name='A', phone='1', item=active_item,
    )
    client.force_authenticate(user=admin_user)

    list_response = client.get('/api/v1/inquiries/')
    assert list_response.status_code == 200
    assert list_response.data['count'] == 1

    update_response = client.patch(f'/api/v1/inquiries/{inquiry.pk}/', {'status': 'CONTACTED'})
    assert update_response.status_code == 200
    inquiry.refresh_from_db()
    assert inquiry.status == Inquiry.Status.CONTACTED


@pytest.mark.django_db
def test_non_admin_cannot_delete_inquiry(client, active_item):
    sales_user = User.objects.create_user(username='sales_mkt', password='pass', role='SALES', email='sales_mkt@fududeeye.local')
    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_INTEREST, full_name='A', phone='1', item=active_item,
    )
    client.force_authenticate(user=sales_user)
    response = client.delete(f'/api/v1/inquiries/{inquiry.pk}/')
    assert response.status_code == 403
    assert Inquiry.objects.filter(pk=inquiry.pk).exists()


@pytest.mark.django_db
def test_general_inquiry_created_anonymously(client):
    response = client.post('/api/v1/inquiries/', {
        'kind': 'GENERAL',
        'full_name': 'Sahra Warsame',
        'phone': '+252618000003',
        'email': 'sahra@example.com',
        'message': 'Do you deliver outside Mogadishu?',
    })
    assert response.status_code == 201
    assert Inquiry.objects.get().status == Inquiry.Status.NEW


@pytest.mark.django_db
def test_general_inquiry_requires_message(client):
    response = client.post('/api/v1/inquiries/', {
        'kind': 'GENERAL',
        'full_name': 'Sahra Warsame',
        'phone': '+252618000003',
    })
    assert response.status_code == 400


# ── convert to Customer / Demand ────────────────────────────────────────────────

@pytest.mark.django_db
def test_convert_item_interest_creates_customer_only(client, admin_user, active_item):
    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_INTEREST, full_name='Amina Hassan', phone='+252618000009', item=active_item,
    )
    client.force_authenticate(user=admin_user)
    response = client.post(f'/api/v1/inquiries/{inquiry.pk}/convert/')
    assert response.status_code == 200
    assert response.data['customer_created'] is True
    assert response.data['demand_id'] is None

    from apps.customers.models import Customer
    customer = Customer.objects.get(pk=response.data['customer_id'])
    assert customer.full_name == 'Amina Hassan'
    assert customer.phone == '+252618000009'

    inquiry.refresh_from_db()
    assert inquiry.status == Inquiry.Status.CONTACTED
    assert inquiry.handled_by == admin_user


@pytest.mark.django_db
def test_convert_item_request_creates_customer_and_demand(client, admin_user, category):
    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_REQUEST, full_name='Yusuf Ali', phone='+252618000010',
        item_needed='Gaming laptop', message='Budget around $500', category=category,
    )
    client.force_authenticate(user=admin_user)
    response = client.post(f'/api/v1/inquiries/{inquiry.pk}/convert/')
    assert response.status_code == 200
    assert response.data['demand_id'] is not None

    from apps.demands.models import Demand
    demand = Demand.objects.get(pk=response.data['demand_id'])
    assert demand.title == 'Gaming laptop'
    assert demand.description == 'Budget around $500'
    assert demand.category_id == category.pk
    assert demand.customer_id == response.data['customer_id']


@pytest.mark.django_db
def test_convert_reuses_existing_customer_by_phone(client, admin_user, category):
    from apps.customers.models import Customer
    existing = Customer.objects.create(full_name='Existing Customer', phone='+252618000011')

    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_REQUEST, full_name='Different Name', phone='+252618000011',
        item_needed='Sofa',
    )
    client.force_authenticate(user=admin_user)
    response = client.post(f'/api/v1/inquiries/{inquiry.pk}/convert/')
    assert response.status_code == 200
    assert response.data['customer_created'] is False
    assert response.data['customer_id'] == existing.pk


@pytest.mark.django_db
def test_anonymous_cannot_convert_inquiry(client, active_item):
    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_INTEREST, full_name='A', phone='1', item=active_item,
    )
    response = client.post(f'/api/v1/inquiries/{inquiry.pk}/convert/')
    assert response.status_code in (401, 403)


# ── website → CRM lead capture (throttle + staff-facing listing details) ───────

@pytest.mark.django_db
def test_inquiry_create_is_rate_limited_by_ip(client, active_item, monkeypatch):
    # DRF's throttle `THROTTLE_RATES` is snapshotted onto the class at import time
    # from settings, so overriding the setting mid-test has no effect — the rate
    # must be monkeypatched onto the throttle class directly.
    monkeypatch.setattr(InquiryCreateThrottle, 'THROTTLE_RATES', {'inquiry_create': '2/hour'})
    payload = {
        'kind': 'ITEM_INTEREST',
        'full_name': 'Amina Hassan',
        'phone': '+252618000001',
        'item': active_item.pk,
    }
    assert client.post('/api/v1/inquiries/', payload).status_code == 201
    assert client.post('/api/v1/inquiries/', payload).status_code == 201
    third = client.post('/api/v1/inquiries/', payload)
    assert third.status_code == 429


@pytest.mark.django_db
def test_staff_inquiry_listing_includes_item_category_and_price(client, admin_user, active_item):
    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_INTEREST, full_name='Amina Hassan', phone='+252618000001', item=active_item,
    )
    client.force_authenticate(user=admin_user)
    response = client.get(f'/api/v1/inquiries/{inquiry.pk}/')
    assert response.status_code == 200
    assert response.data['item_category_name'] == active_item.category.name
    assert response.data['item_listed_price'] == active_item.listed_price
    assert response.data['item_owner_type'] == active_item.owner_type


@pytest.mark.django_db
def test_staff_inquiry_listing_details_are_null_without_an_item(client, admin_user, category):
    inquiry = Inquiry.objects.create(
        kind=Inquiry.Kind.ITEM_REQUEST, full_name='Yusuf Ali', phone='+252618000002',
        item_needed='55-inch TV', category=category,
    )
    client.force_authenticate(user=admin_user)
    response = client.get(f'/api/v1/inquiries/{inquiry.pk}/')
    assert response.status_code == 200
    assert response.data['item_category_name'] is None
    assert response.data['item_listed_price'] is None
