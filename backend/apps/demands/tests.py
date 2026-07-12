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
    return User.objects.create_user(username='admin_demands', password='pass', role='ADMIN', email='admin_demands@fududeeye.local')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='sales_demands', password='pass', role='SALES', email='sales_demands@fududeeye.local')


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username='manager_demands', password='pass', role='MANAGER', email='manager_demands@fududeeye.local')


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
def test_suggest_matches_filters_same_category_inside_price_range(
    client,
    admin_user,
    customer,
    category,
    furniture_category,
):
    active = make_company_item(category, 'Dell Latitude', '300.00')
    # Draft still counts — staff can match a demand to inventory that isn't
    # published to the marketplace yet.
    draft = make_company_item(category, 'Draft Laptop', '300.00', status=Item.Status.DRAFT)
    make_company_item(category, 'Too Cheap Phone', '150.00')
    make_company_item(category, 'Too Expensive Laptop', '450.00')
    # Reserved/sold stock is no longer available, so it stays excluded.
    make_company_item(category, 'Reserved Laptop', '300.00', status=Item.Status.RESERVED)
    make_company_item(furniture_category, 'Office Chair', '300.00')
    demand = Demand.objects.create(
        customer=customer,
        title='Laptop wanted',
        category=category,
        target_price_min=Decimal('200.00'),
        target_price_max=Decimal('400.00'),
    )

    matches = list(demand.suggest_matches())
    assert set(matches) == {active, draft}

    client.force_authenticate(user=admin_user)
    resp = client.get(f'/api/v1/demands/{demand.pk}/suggested-matches/')
    assert resp.status_code == 200
    assert {item['id'] for item in resp.data} == {active.pk, draft.pk}


@pytest.mark.django_db
def test_demand_history_tracks_status_change(client, admin_user, customer, category):
    client.force_authenticate(user=admin_user)
    create_resp = client.post('/api/v1/demands/', demand_payload(customer, category))
    demand_id = create_resp.data['id']

    client.patch(f'/api/v1/demands/{demand_id}/', {'status': Demand.Status.FULFILLED})

    resp = client.get(f'/api/v1/demands/{demand_id}/history/')
    assert resp.status_code == 200
    update_row = next(row for row in resp.data['results'] if row['action'] == 'UPDATE')
    assert update_row['changes']['status'] == {'old': 'OPEN', 'new': 'FULFILLED'}


@pytest.mark.django_db
def test_sales_user_cannot_delete_demand(client, sales_user, customer, category):
    demand = Demand.objects.create(customer=customer, title='Laptop wanted', category=category)

    client.force_authenticate(user=sales_user)
    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code == 403
    assert Demand.objects.filter(pk=demand.pk).exists()


# --- business rule: delete demand (Admin-only, status-gated) ─────────────────

@pytest.mark.django_db
def test_admin_can_delete_open_demand(client, admin_user, customer, category):
    demand = Demand.objects.create(customer=customer, title='Open one', category=category, status=Demand.Status.OPEN)

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code == 204
    assert not Demand.objects.filter(pk=demand.pk).exists()


@pytest.mark.django_db
def test_admin_can_delete_matched_demand_without_touching_item(client, admin_user, customer, category):
    item = make_company_item(category, 'Matched Laptop', '300.00')
    demand = Demand.objects.create(
        customer=customer, title='Matched one', category=category,
        status=Demand.Status.MATCHED, matched_item=item,
    )

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code == 204
    assert not Demand.objects.filter(pk=demand.pk).exists()
    # The matched item itself must be completely untouched.
    item.refresh_from_db()
    assert Item.objects.filter(pk=item.pk).exists()
    assert item.status == Item.Status.ACTIVE


@pytest.mark.django_db
def test_admin_can_delete_dropped_demand(client, admin_user, customer, category):
    demand = Demand.objects.create(customer=customer, title='Dropped one', category=category, status=Demand.Status.DROPPED)

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code == 204
    assert not Demand.objects.filter(pk=demand.pk).exists()


@pytest.mark.django_db
def test_admin_cannot_delete_fulfilled_demand(client, admin_user, customer, category):
    item = make_company_item(category, 'Sold Laptop', '300.00')
    demand = Demand.objects.create(
        customer=customer, title='Fulfilled one', category=category,
        status=Demand.Status.FULFILLED, matched_item=item,
    )

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code == 400
    assert 'cannot be deleted' in resp.data['detail']
    assert Demand.objects.filter(pk=demand.pk).exists()


@pytest.mark.django_db
def test_manager_cannot_delete_demand(client, manager_user, customer, category):
    demand = Demand.objects.create(customer=customer, title='Laptop wanted', category=category)

    client.force_authenticate(user=manager_user)
    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code == 403
    assert Demand.objects.filter(pk=demand.pk).exists()


@pytest.mark.django_db
def test_anonymous_cannot_delete_demand(client, customer, category):
    demand = Demand.objects.create(customer=customer, title='Laptop wanted', category=category)

    resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert resp.status_code in (401, 403)
    assert Demand.objects.filter(pk=demand.pk).exists()


@pytest.mark.django_db
def test_delete_nonexistent_demand_returns_404(client, admin_user):
    client.force_authenticate(user=admin_user)
    resp = client.delete('/api/v1/demands/999999/')
    assert resp.status_code == 404


@pytest.mark.django_db
def test_delete_demand_only_removes_target_and_preserves_related_records(client, admin_user, customer, category):
    """Deleting one demand must not touch the customer, an unrelated demand,
    or a matched item belonging to a different (untouched) demand."""
    item = make_company_item(category, 'Untouched Item', '300.00')
    target = Demand.objects.create(customer=customer, title='Delete me', category=category, status=Demand.Status.OPEN)
    unrelated = Demand.objects.create(
        customer=customer, title='Keep me', category=category,
        status=Demand.Status.MATCHED, matched_item=item,
    )

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/demands/{target.pk}/')
    assert resp.status_code == 204

    assert not Demand.objects.filter(pk=target.pk).exists()
    assert Demand.objects.filter(pk=unrelated.pk).exists()
    assert Customer.objects.filter(pk=customer.pk).exists()
    assert Item.objects.filter(pk=item.pk).exists()


@pytest.mark.django_db
def test_delete_open_demand_updates_dashboard_open_count(client, admin_user, customer, category):
    demand = Demand.objects.create(customer=customer, title='Open one', category=category, status=Demand.Status.OPEN)

    client.force_authenticate(user=admin_user)
    before = client.get('/api/v1/reports/dashboard/')
    assert before.status_code == 200
    assert before.data['counts']['open_demands'] == 1

    del_resp = client.delete(f'/api/v1/demands/{demand.pk}/')
    assert del_resp.status_code == 204

    after = client.get('/api/v1/reports/dashboard/')
    assert after.status_code == 200
    assert after.data['counts']['open_demands'] == 0


@pytest.mark.django_db
def test_deleted_demand_is_audited(client, admin_user, customer, category):
    """Deletion must be captured by the existing AuditedModel post_delete
    signal (apps/core/signals.py) — no bespoke audit code should be needed."""
    demand = Demand.objects.create(customer=customer, title='Audit me', category=category, status=Demand.Status.OPEN)
    demand_pk = demand.pk

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/demands/{demand_pk}/')
    assert resp.status_code == 204

    from apps.core.models import AuditLog
    log = AuditLog.objects.filter(model_name='Demand', object_id=str(demand_pk), action=AuditLog.Action.DELETE).first()
    assert log is not None
    assert 'Audit me' in log.object_repr
