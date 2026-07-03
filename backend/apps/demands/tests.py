from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.customers.models import Customer
from apps.inventory.models import Category, Item

from .models import Demand

User = get_user_model()


@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='admin_demands', password='pass', role='ADMIN')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='sales_demands', password='pass', role='SALES')


@pytest.fixture
def customer(db):
    return Customer.objects.create(full_name='Faadumo Aweys', phone='+252 61 700 0001')


@pytest.fixture
def category(db):
    return Category.objects.create(name='Electronics', kind=Category.Kind.ELECTRONICS)


@pytest.fixture
def furniture_category(db):
    return Category.objects.create(name='Furniture', kind=Category.Kind.FURNITURE)


def demand_payload(customer, category):
    return {
        'customer': customer.pk,
        'title': 'Looking for a used laptop',
        'description': 'Core i5, 8GB RAM or better.',
        'category': category.pk,
        'target_price_min': '200.00',
        'target_price_max': '400.00',
        'notes': 'Buyer prefers Dell or HP.',
    }


def make_company_item(category, title, listed_price, status=Item.Status.ACTIVE):
    return Item.objects.create(
        title=title,
        category=category,
        owner_type=Item.OwnerType.COMPANY,
        cost_price=Decimal('100.00'),
        listed_price=Decimal(listed_price),
        status=status,
    )


@pytest.mark.django_db
def test_create_demand(client, admin_user, customer, category):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/demands/', demand_payload(customer, category))
    assert resp.status_code == 201
    assert resp.data['title'] == 'Looking for a used laptop'
    assert resp.data['status'] == Demand.Status.OPEN
    assert resp.data['customer'] == customer.pk
    assert resp.data['customer_name'] == customer.full_name
    assert resp.data['category_name'] == category.name
    assert resp.data['matched_item_title'] is None


@pytest.mark.django_db
def test_list_demands(client, admin_user, customer, category):
    Demand.objects.create(customer=customer, title='Laptop wanted', category=category)
    Demand.objects.create(customer=customer, title='Phone wanted', category=category)

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/demands/')
    assert resp.status_code == 200
    assert resp.data['count'] == 2


@pytest.mark.django_db
def test_filter_demands_by_status(client, admin_user, customer, category):
    Demand.objects.create(customer=customer, title='Open demand', category=category)
    Demand.objects.create(
        customer=customer,
        title='Matched demand',
        category=category,
        status=Demand.Status.MATCHED,
    )

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/demands/?status=MATCHED')
    assert resp.status_code == 200
    titles = [d['title'] for d in resp.data['results']]
    assert titles == ['Matched demand']


@pytest.mark.django_db
def test_search_demands_by_title(client, admin_user, customer, category):
    Demand.objects.create(customer=customer, title='Solar panels', category=category)
    Demand.objects.create(customer=customer, title='Office chairs', category=category)

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/demands/?search=solar')
    assert resp.status_code == 200
    titles = [d['title'] for d in resp.data['results']]
    assert 'Solar panels' in titles
    assert 'Office chairs' not in titles


@pytest.mark.django_db
def test_rejects_invalid_price_range(client, admin_user, customer, category):
    payload = demand_payload(customer, category)
    payload['target_price_min'] = '500.00'
    payload['target_price_max'] = '300.00'

    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/demands/', payload)
    assert resp.status_code == 400
    assert 'target_price_max' in resp.data


@pytest.mark.django_db
def test_suggest_matches_filters_active_same_category_inside_price_range(
    client,
    admin_user,
    customer,
    category,
    furniture_category,
):
    inside = make_company_item(category, 'Dell Latitude', '300.00')
    make_company_item(category, 'Too Cheap Phone', '150.00')
    make_company_item(category, 'Too Expensive Laptop', '450.00')
    make_company_item(category, 'Draft Laptop', '300.00', status=Item.Status.DRAFT)
    make_company_item(furniture_category, 'Office Chair', '300.00')
    demand = Demand.objects.create(
        customer=customer,
        title='Laptop wanted',
        category=category,
        target_price_min=Decimal('200.00'),
        target_price_max=Decimal('400.00'),
    )

    matches = list(demand.suggest_matches())
    assert matches == [inside]

    client.force_authenticate(user=admin_user)
    resp = client.get(f'/api/v1/demands/{demand.pk}/suggested-matches/')
    assert resp.status_code == 200
    assert [item['id'] for item in resp.data] == [inside.pk]


@pytest.mark.django_db
def test_sales_user_cannot_delete_demand(client, sales_user, customer, category):
    demand = Demand.objects.create(customer=customer, title='Laptop wanted', category=category)

    client.force_authenticate(user=sales_user)
    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code == 403
    assert Demand.objects.filter(pk=demand.pk).exists()
