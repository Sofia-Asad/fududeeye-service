import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from apps.customers.models import Customer
from .models import Category, Item, ItemImage

User = get_user_model()


def tiny_png(name='photo.png'):
    # 1x1 transparent PNG
    content = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01'
        b'\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    return SimpleUploadedFile(name, content, content_type='image/png')


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
    assert resp.data['owner_name'] == consignment_owner.full_name
    assert resp.data['category_name'] == category.name
    assert resp.data['category_kind'] == category.kind
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
def test_filter_by_owner(client, admin_user, category, consignment_owner):
    other_owner = Customer.objects.create(full_name='Sahra Ali', phone='+252 61 100 0002')
    client.force_authenticate(user=admin_user)
    client.post('/api/v1/items/', consignment_payload(category, consignment_owner))
    client.post('/api/v1/items/', {
        **consignment_payload(category, other_owner),
        'title': 'Other Consignment Phone',
    })

    resp = client.get(f'/api/v1/items/?owner={consignment_owner.pk}')
    assert resp.status_code == 200
    owners = [item['owner'] for item in resp.data['results']]
    assert owners == [consignment_owner.pk]


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
def test_sales_user_can_list_categories(client, sales_user, category):
    client.force_authenticate(user=sales_user)
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
def test_sales_user_cannot_create_category(client, sales_user):
    client.force_authenticate(user=sales_user)
    resp = client.post('/api/v1/categories/', {'name': 'Vehicles', 'kind': 'VEHICLE'})
    assert resp.status_code == 403


@pytest.mark.django_db
def test_manager_cannot_delete_category(client, manager_user, category):
    """MANAGER role may manage categories, but hard-delete is Admin-only."""
    client.force_authenticate(user=manager_user)
    resp = client.delete(f'/api/v1/categories/{category.pk}/')
    assert resp.status_code == 403
    assert Category.objects.filter(pk=category.pk).exists()


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


@pytest.mark.django_db
def test_sales_user_cannot_create_published_item(client, sales_user, category):
    client.force_authenticate(user=sales_user)
    payload = {
        **company_payload(category),
        'status': 'ACTIVE',
    }

    resp = client.post('/api/v1/items/', payload)

    assert resp.status_code == 400
    assert 'status' in resp.data


# ── item images ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_first_uploaded_image_becomes_primary(client, admin_user, category):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/items/', company_payload(category))
    item_pk = resp.data['id']

    upload = client.post(f'/api/v1/items/{item_pk}/images/', {'image': tiny_png()}, format='multipart')
    assert upload.status_code == 201
    assert upload.data['is_primary'] is True


@pytest.mark.django_db
def test_second_uploaded_image_is_not_primary(client, admin_user, category):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/items/', company_payload(category))
    item_pk = resp.data['id']

    client.post(f'/api/v1/items/{item_pk}/images/', {'image': tiny_png('a.png')}, format='multipart')
    second = client.post(f'/api/v1/items/{item_pk}/images/', {'image': tiny_png('b.png')}, format='multipart')
    assert second.data['is_primary'] is False


@pytest.mark.django_db
def test_deleting_primary_image_promotes_next_one(client, admin_user, category):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/items/', company_payload(category))
    item_pk = resp.data['id']

    first = client.post(f'/api/v1/items/{item_pk}/images/', {'image': tiny_png('a.png')}, format='multipart')
    second = client.post(f'/api/v1/items/{item_pk}/images/', {'image': tiny_png('b.png')}, format='multipart')

    delete_resp = client.delete(f'/api/v1/items/{item_pk}/images/{first.data["id"]}/')
    assert delete_resp.status_code == 204
    assert not ItemImage.objects.filter(pk=first.data['id']).exists()

    remaining = ItemImage.objects.get(pk=second.data['id'])
    assert remaining.is_primary is True


@pytest.mark.django_db
def test_sales_user_cannot_delete_image_on_others_item(client, sales_user, category):
    admin = User.objects.create_user(username='img_admin', password='pass', role='ADMIN')
    c = APIClient()
    c.default_format = 'json'
    c.force_authenticate(user=admin)
    created = c.post('/api/v1/items/', company_payload(category))
    item_pk = created.data['id']
    image = c.post(f'/api/v1/items/{item_pk}/images/', {'image': tiny_png()}, format='multipart')

    client.force_authenticate(user=sales_user)
    resp = client.delete(f'/api/v1/items/{item_pk}/images/{image.data["id"]}/')
    assert resp.status_code == 403
