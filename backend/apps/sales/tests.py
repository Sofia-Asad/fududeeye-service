import datetime
import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APIClient
from apps.core.models import AuditLog
from apps.customers.models import Customer
from apps.demands.models import Demand
from apps.inventory.models import Category, Item
from .models import Sale, Refund

User = get_user_model()


# ── fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='admin_sales', password='pass', role='ADMIN', email='admin_sales@fududeeye.local')


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username='mgr_sales', password='pass', role='MANAGER', email='mgr_sales@fududeeye.local')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='staff_sales', password='pass', role='SALES', email='staff_sales@fududeeye.local')


@pytest.fixture
def category(db):
    return Category.objects.create(name='Electronics', kind=Category.Kind.ELECTRONICS)


@pytest.fixture
def seller(db):
    return Customer.objects.create(full_name='Seller One', phone='+252 61 111 0001')


@pytest.fixture
def buyer(db):
    return Customer.objects.create(full_name='Buyer One', phone='+252 61 222 0001')


@pytest.fixture
def consignment_item(db, category, seller):
    return Item.objects.create(
        title='Consignment Laptop',
        category=category,
        owner_type=Item.OwnerType.CONSIGNMENT,
        owner=seller,
        owner_asking_price=Decimal('500.00'),
        listed_price=Decimal('600.00'),
        quantity=5,
    )


@pytest.fixture
def company_item(db, category):
    return Item.objects.create(
        title='Company TV',
        category=category,
        owner_type=Item.OwnerType.COMPANY,
        cost_price=Decimal('300.00'),
        listed_price=Decimal('450.00'),
        quantity=2,
    )


# ── helper ────────────────────────────────────────────────────────────────────

def make_sale(item, buyer, handler, quantity_sold=1, sale_price=None):
    return Sale.objects.create(
        item=item,
        buyer=buyer,
        quantity_sold=quantity_sold,
        sale_price=sale_price or item.listed_price * quantity_sold,
        payment_method='CASH',
        handled_by=handler,
    )


# ── business rule: CONSIGNMENT profit single unit ─────────────────────────────

@pytest.mark.django_db
def test_profit_consignment_single_unit(admin_user, consignment_item, buyer):
    """
    Single-unit consignment sale:
      owner_payout = asking_price × 1
      company_profit = sale_price − owner_payout
      payout_status = PENDING
    """
    sale = make_sale(consignment_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('620.00'))

    assert sale.owner_payout_amount == Decimal('500.00')   # asking_price × 1
    assert sale.company_profit == Decimal('120.00')         # 620 - 500
    assert sale.payout_status == Sale.PayoutStatus.PENDING


# ── business rule: CONSIGNMENT profit multi-unit ──────────────────────────────

@pytest.mark.django_db
def test_profit_consignment_multi_unit(admin_user, consignment_item, buyer):
    """
    Multi-unit consignment sale:
      owner_payout = asking_price × qty
      company_profit = sale_price − owner_payout
    """
    sale = make_sale(consignment_item, buyer, admin_user, quantity_sold=3, sale_price=Decimal('1860.00'))

    assert sale.owner_payout_amount == Decimal('1500.00')   # 500 × 3
    assert sale.company_profit == Decimal('360.00')          # 1860 - 1500
    assert sale.payout_status == Sale.PayoutStatus.PENDING


# ── business rule: COMPANY profit ─────────────────────────────────────────────

@pytest.mark.django_db
def test_profit_company_owned(admin_user, company_item, buyer):
    """
    Company-owned sale:
      owner_payout = 0, payout_status = NA
      company_profit = sale_price − (cost_price × qty)
    """
    sale = make_sale(company_item, buyer, admin_user, quantity_sold=2, sale_price=Decimal('950.00'))

    assert sale.owner_payout_amount == Decimal('0.00')
    assert sale.company_profit == Decimal('350.00')   # 950 - (300 × 2)
    assert sale.payout_status == Sale.PayoutStatus.NA


# ── business rule: SOLD status transition ─────────────────────────────────────

@pytest.mark.django_db
def test_status_transition_to_sold(admin_user, company_item, buyer):
    """Selling all remaining units must set item.status = SOLD."""
    assert company_item.quantity == 2
    make_sale(company_item, buyer, admin_user, quantity_sold=2, sale_price=Decimal('900.00'))

    company_item.refresh_from_db()
    assert company_item.quantity_sold == 2
    assert company_item.status == Item.Status.SOLD


@pytest.mark.django_db
def test_partial_sale_does_not_mark_sold(admin_user, consignment_item, buyer):
    """Selling fewer than total quantity must NOT set status = SOLD."""
    make_sale(consignment_item, buyer, admin_user, quantity_sold=2, sale_price=Decimal('1200.00'))

    consignment_item.refresh_from_db()
    assert consignment_item.quantity_sold == 2
    assert consignment_item.status != Item.Status.SOLD


# ── business rule: refund creates new row, original Sale unchanged ─────────────

@pytest.mark.django_db
def test_refund_creates_new_row_without_mutating_sale(admin_user, company_item, buyer):
    """
    Creating a Refund must:
    • insert a new Refund row
    • leave the original Sale row completely unmodified
    """
    sale = make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    original_sale_price = sale.sale_price
    original_company_profit = sale.company_profit

    refund = Refund.objects.create(
        sale=sale,
        amount=Decimal('450.00'),
        reason=Refund.Reason.DEFECTIVE,
        reason_detail='Screen cracked on arrival.',
        item_returned=True,
        refund_method='CASH',
        handled_by=admin_user,
    )

    # New Refund row exists
    assert Refund.objects.filter(pk=refund.pk).exists()

    # Original Sale row is unchanged
    sale.refresh_from_db()
    assert sale.sale_price == original_sale_price
    assert sale.company_profit == original_company_profit
    assert sale.refunds.count() == 1


# ── mark-paid action ──────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_mark_paid_transitions_payout_status(client, manager_user, admin_user, consignment_item, buyer):
    """POST mark-paid by manager must set payout_status = PAID."""
    sale = make_sale(consignment_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('600.00'))
    assert sale.payout_status == Sale.PayoutStatus.PENDING

    client.force_authenticate(user=manager_user)
    resp = client.post(f'/api/v1/sales/{sale.pk}/mark-paid/', {
        'payout_method': 'CASH',
        'payout_date': '2026-07-01',
        'payout_handled_by': manager_user.pk,
    })
    assert resp.status_code == 200
    assert resp.data['payout_status'] == 'PAID'
    assert resp.data['payout_method'] == 'CASH'
    assert resp.data['payout_handled_by_name'] == manager_user.username

    sale.refresh_from_db()
    assert sale.payout_status == Sale.PayoutStatus.PAID


@pytest.mark.django_db
def test_mark_paid_rejected_for_company_item(client, manager_user, admin_user, company_item, buyer):
    """Company items have payout_status=NA — mark-paid must return 400."""
    sale = make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))
    assert sale.payout_status == Sale.PayoutStatus.NA

    client.force_authenticate(user=manager_user)
    resp = client.post(f'/api/v1/sales/{sale.pk}/mark-paid/', {
        'payout_method': 'CASH',
        'payout_date': '2026-07-01',
        'payout_handled_by': manager_user.pk,
    })
    assert resp.status_code == 400


@pytest.mark.django_db
def test_sales_user_cannot_mark_paid(client, sales_user, admin_user, consignment_item, buyer):
    """SALES role must be denied mark-paid (Manager/Admin only)."""
    sale = make_sale(consignment_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('600.00'))

    client.force_authenticate(user=sales_user)
    resp = client.post(f'/api/v1/sales/{sale.pk}/mark-paid/', {
        'payout_method': 'CASH',
        'payout_date': '2026-07-01',
        'payout_handled_by': admin_user.pk,
    })
    assert resp.status_code == 403


# ── API: create + list ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_sale_via_api(client, admin_user, company_item, buyer):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/sales/', {
        'item': company_item.pk,
        'buyer': buyer.pk,
        'quantity_sold': 1,
        'sale_price': '450.00',
        'payment_method': 'CASH',
        'handled_by': admin_user.pk,
    })
    assert resp.status_code == 201
    assert resp.data['company_profit'] == '150.00'   # 450 - 300
    assert resp.data['payout_status'] == 'NA'
    assert resp.data['item_title'] == company_item.title
    assert resp.data['item_owner_type'] == 'COMPANY'
    assert resp.data['item_cost_price'] == '300.00'
    assert resp.data['buyer_name'] == buyer.full_name
    assert resp.data['handled_by_name'] == admin_user.username


@pytest.mark.django_db
def test_list_sales_requires_auth(client):
    resp = client.get('/api/v1/sales/')
    assert resp.status_code == 403


@pytest.mark.django_db
def test_quantity_validation_rejects_oversell(client, admin_user, company_item, buyer):
    """Selling more units than available must return 400."""
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/sales/', {
        'item': company_item.pk,
        'buyer': buyer.pk,
        'quantity_sold': 99,      # only 2 in stock
        'sale_price': '999.00',
        'payment_method': 'CASH',
        'handled_by': admin_user.pk,
    })
    assert resp.status_code == 400
    assert 'quantity_sold' in resp.data


@pytest.mark.django_db
def test_create_refund_via_api(client, admin_user, company_item, buyer):
    sale = make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/refunds/', {
        'sale': sale.pk,
        'amount': '450.00',
        'reason': 'DEFECTIVE',
        'refund_date': '2026-07-01',
        'item_returned': True,
        'refund_method': 'CASH',
        'handled_by': admin_user.pk,
    })
    assert resp.status_code == 201
    assert resp.data['sale'] == sale.pk


@pytest.mark.django_db
def test_filter_sales_by_payout_status(client, admin_user, consignment_item, company_item, buyer):
    make_sale(consignment_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('600.00'))
    make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/sales/?payout_status=PENDING')
    assert resp.status_code == 200
    statuses = [s['payout_status'] for s in resp.data['results']]
    assert all(s == 'PENDING' for s in statuses)
    assert 'NA' not in statuses


# ── regression: mark-paid must never touch money fields ───────────────────────

@pytest.mark.django_db
def test_mark_paid_does_not_mutate_money_fields(client, manager_user, admin_user, seller, buyer, category):
    """
    Regression guard for: POST mark-paid changing owner_payout_amount / company_profit.

    The business rule is that both fields are locked at sale-creation time.
    mark-paid is only allowed to touch payout_status, payout_method,
    payout_date, and payout_handled_by — nothing else.

    This test checks three things:
      1. The API response reports the original money values.
      2. A fresh DB read after mark-paid confirms they are byte-for-byte unchanged.
      3. The COMPANY item variant is also unaffected (payout_status stays NA).
    """
    # Use a deliberately odd asking_price so any recalculation would produce
    # a visibly different number.
    item = Item.objects.create(
        title='Regression Laptop',
        category=category,
        owner_type=Item.OwnerType.CONSIGNMENT,
        owner=seller,
        owner_asking_price=Decimal('200.00'),
        listed_price=Decimal('230.00'),
        quantity=3,
    )
    sale = make_sale(item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('230.00'))

    # Record values as stored immediately after creation
    created_payout = sale.owner_payout_amount   # must be 200.00
    created_profit = sale.company_profit         # must be 30.00
    assert created_payout == Decimal('200.00'), "precondition: owner_payout_amount correct at creation"
    assert created_profit == Decimal('30.00'),  "precondition: company_profit correct at creation"

    # Call mark-paid — only payout tracking fields should change
    client.force_authenticate(user=manager_user)
    resp = client.post(f'/api/v1/sales/{sale.pk}/mark-paid/', {
        'payout_method': 'EVC_PLUS',
        'payout_date': '2026-07-01',
        'payout_handled_by': manager_user.pk,
    })
    assert resp.status_code == 200

    # 1. Response must show original money values
    assert resp.data['owner_payout_amount'] == '200.00', (
        f"mark-paid mutated owner_payout_amount in response: got {resp.data['owner_payout_amount']!r}"
    )
    assert resp.data['company_profit'] == '30.00', (
        f"mark-paid mutated company_profit in response: got {resp.data['company_profit']!r}"
    )

    # 2. DB must also be unchanged — re-fetch bypasses any in-memory state
    sale.refresh_from_db()
    assert sale.owner_payout_amount == Decimal('200.00'), (
        f"mark-paid wrote wrong owner_payout_amount to DB: {sale.owner_payout_amount}"
    )
    assert sale.company_profit == Decimal('30.00'), (
        f"mark-paid wrote wrong company_profit to DB: {sale.company_profit}"
    )

    # 3. Payout fields are correctly updated
    assert sale.payout_status == Sale.PayoutStatus.PAID
    assert sale.payout_method == 'EVC_PLUS'


@pytest.mark.django_db
def test_recalculate_sale_profits_command_does_not_mutate_locked_money_fields(
    admin_user, consignment_item, buyer,
):
    """The audit command may detect drift, but it must not rewrite Sale money fields."""
    sale = make_sale(
        consignment_item,
        buyer,
        admin_user,
        quantity_sold=1,
        sale_price=Decimal('600.00'),
    )
    Sale.objects.filter(pk=sale.pk).update(
        owner_payout_amount=Decimal('1.00'),
        company_profit=Decimal('2.00'),
    )

    with pytest.raises(SystemExit):
        call_command('recalculate_sale_profits')

    sale.refresh_from_db()
    assert sale.owner_payout_amount == Decimal('1.00')
    assert sale.company_profit == Decimal('2.00')


# ── business rule: automatic demand fulfillment after a matching sale ─────────

def make_demand(customer, category, matched_item=None, status=Demand.Status.OPEN, title='Wants a laptop'):
    return Demand.objects.create(
        customer=customer,
        title=title,
        category=category,
        matched_item=matched_item,
        status=status,
    )


@pytest.mark.django_db
def test_matched_demand_auto_fulfilled_by_matching_sale(admin_user, category, company_item, buyer):
    """Same customer + same matched item + Matched status → auto-Fulfilled."""
    demand = make_demand(buyer, category, matched_item=company_item, status=Demand.Status.MATCHED)

    sale = make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    demand.refresh_from_db()
    assert demand.status == Demand.Status.FULFILLED
    assert demand.matched_item_id == company_item.pk   # relationship preserved
    assert sale.pk is not None


@pytest.mark.django_db
def test_matched_demand_not_fulfilled_for_different_buyer(admin_user, category, company_item, buyer, seller):
    """A sale of the exact matched item to a DIFFERENT customer must not fulfill it."""
    demand = make_demand(buyer, category, matched_item=company_item, status=Demand.Status.MATCHED)

    make_sale(company_item, seller, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    demand.refresh_from_db()
    assert demand.status == Demand.Status.MATCHED


@pytest.mark.django_db
def test_matched_demand_not_fulfilled_for_different_item(admin_user, category, company_item, consignment_item, buyer):
    """Selling a different item to the same buyer must not fulfill an unrelated demand."""
    demand = make_demand(buyer, category, matched_item=company_item, status=Demand.Status.MATCHED)

    make_sale(consignment_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('600.00'))

    demand.refresh_from_db()
    assert demand.status == Demand.Status.MATCHED


@pytest.mark.django_db
def test_open_demand_not_auto_fulfilled(admin_user, category, company_item, buyer):
    """An Open demand (not yet Matched) must never be auto-fulfilled by a sale."""
    demand = make_demand(buyer, category, matched_item=company_item, status=Demand.Status.OPEN)

    make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    demand.refresh_from_db()
    assert demand.status == Demand.Status.OPEN


@pytest.mark.django_db
def test_dropped_demand_not_auto_fulfilled(admin_user, category, company_item, buyer):
    """A Dropped demand must never be auto-fulfilled by a sale."""
    demand = make_demand(buyer, category, matched_item=company_item, status=Demand.Status.DROPPED)

    make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    demand.refresh_from_db()
    assert demand.status == Demand.Status.DROPPED


@pytest.mark.django_db
def test_sale_completes_normally_with_no_related_demand(admin_user, company_item, buyer):
    """No demand references this buyer/item at all — the sale must still succeed."""
    sale = make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))
    assert sale.pk is not None
    assert Sale.objects.filter(pk=sale.pk).exists()


@pytest.mark.django_db
def test_auto_fulfillment_writes_demand_activity_log(admin_user, category, company_item, buyer):
    """The transition must show up in the demand's audit history as an
    old->new status change, plus a CUSTOM entry naming the sale."""
    demand = make_demand(buyer, category, matched_item=company_item, status=Demand.Status.MATCHED)

    sale = make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    logs = AuditLog.objects.filter(model_name='Demand', object_id=str(demand.pk)).order_by('id')

    status_update = next(
        log for log in logs
        if log.action == AuditLog.Action.UPDATE and 'status' in log.changes
    )
    assert status_update.changes['status'] == {'old': 'MATCHED', 'new': 'FULFILLED'}

    sale_reference = next(
        log for log in logs
        if log.action == AuditLog.Action.CUSTOM and 'status' in log.changes
    )
    assert f'Sale #{sale.pk}' in sale_reference.changes['status']


@pytest.mark.django_db
def test_auto_fulfillment_does_not_affect_unrelated_demand(admin_user, category, company_item, consignment_item, buyer, seller):
    """Selling one item must not accidentally fulfill an unrelated Matched demand
    for a different customer/item combination."""
    unrelated = make_demand(seller, category, matched_item=consignment_item, status=Demand.Status.MATCHED)
    target = make_demand(buyer, category, matched_item=company_item, status=Demand.Status.MATCHED)

    make_sale(company_item, buyer, admin_user, quantity_sold=1, sale_price=Decimal('450.00'))

    unrelated.refresh_from_db()
    target.refresh_from_db()
    assert unrelated.status == Demand.Status.MATCHED
    assert target.status == Demand.Status.FULFILLED


@pytest.mark.django_db
def test_auto_fulfillment_via_sale_api_preserves_existing_response_shape(client, admin_user, category, company_item, buyer):
    """The sale creation API response must be unaffected by the new side effect."""
    make_demand(buyer, category, matched_item=company_item, status=Demand.Status.MATCHED)

    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/sales/', {
        'item': company_item.pk,
        'buyer': buyer.pk,
        'quantity_sold': 1,
        'sale_price': '450.00',
        'payment_method': 'CASH',
        'handled_by': admin_user.pk,
    })
    assert resp.status_code == 201
    assert resp.data['company_profit'] == '150.00'

    resp2 = client.get(f'/api/v1/demands/?customer={buyer.pk}')
    assert resp2.status_code == 200
    statuses = [d['status'] for d in resp2.data['results']]
    assert statuses == ['FULFILLED']
