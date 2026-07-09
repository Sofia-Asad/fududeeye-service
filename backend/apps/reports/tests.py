from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from apps.complaints.models import Complaint
from apps.core.models import AuditLog
from apps.customers.models import Customer
from apps.demands.models import Demand
from apps.finance.models import Expense, ExpenseCategory
from apps.inventory.models import Category, Item
from apps.sales.models import Refund, Sale

User = get_user_model()


@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username='manager_reports', password='pass', role='MANAGER', email='manager_reports@fududeeye.local')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='sales_reports', password='pass', role='SALES', email='sales_reports@fududeeye.local')


@pytest.fixture
def report_data(db, manager_user):
    today = timezone.localdate()
    category = Category.objects.create(name='Electronics', kind=Category.Kind.ELECTRONICS)
    furniture = Category.objects.create(name='Furniture', kind=Category.Kind.FURNITURE)
    seller = Customer.objects.create(full_name='Seller One', phone='+252 61 900 0001')
    buyer = Customer.objects.create(full_name='Buyer One', phone='+252 61 900 0002')

    consignment = Item.objects.create(
        title='Consignment Laptop',
        category=category,
        owner_type=Item.OwnerType.CONSIGNMENT,
        owner=seller,
        owner_asking_price=Decimal('200.00'),
        listed_price=Decimal('250.00'),
    )
    sale = Sale.objects.create(
        item=consignment,
        buyer=buyer,
        quantity_sold=1,
        sale_price=Decimal('250.00'),
        sale_date=today,
        payment_method=Sale.PaymentMethod.CASH,
        handled_by=manager_user,
    )
    Refund.objects.create(
        sale=sale,
        amount=Decimal('25.00'),
        reason=Refund.Reason.OTHER,
        reason_detail='Partial goodwill refund.',
        refund_date=today,
        refund_method=Sale.PaymentMethod.CASH,
        handled_by=manager_user,
    )

    match = Item.objects.create(
        title='Available Laptop',
        category=category,
        owner_type=Item.OwnerType.COMPANY,
        cost_price=Decimal('150.00'),
        listed_price=Decimal('275.00'),
        status=Item.Status.ACTIVE,
    )
    Demand.objects.create(
        customer=buyer,
        title='Laptop wanted',
        category=category,
        target_price_min=Decimal('200.00'),
        target_price_max=Decimal('300.00'),
    )
    Demand.objects.create(
        customer=buyer,
        title='Chair wanted',
        category=furniture,
        target_price_max=Decimal('100.00'),
        status=Demand.Status.MATCHED,
    )
    Complaint.objects.create(
        customer=buyer,
        related_sale=sale,
        subject='Battery issue',
        description='Battery does not hold charge.',
        priority=Complaint.Priority.HIGH,
    )
    expense_category = ExpenseCategory.objects.create(name='Rent')
    Expense.objects.create(
        category=expense_category,
        amount=Decimal('450.00'),
        expense_date=today,
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )
    AuditLog.objects.create(
        user=manager_user,
        action=AuditLog.Action.CUSTOM,
        model_name='ReportFixture',
        object_id='1',
        object_repr='Report fixture',
        changes={},
    )

    return {
        'today': today,
        'category': category,
        'buyer': buyer,
        'match': match,
        'sale': sale,
        'expense_category': expense_category,
    }


@pytest.mark.django_db
def test_dashboard_includes_required_kpis(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/dashboard/')
    assert resp.status_code == 200
    assert resp.data['today_sales_count'] == 1
    assert resp.data['today_profit'] == '50.00'
    assert resp.data['pending_payouts_total'] == '200.00'
    assert resp.data['open_complaints'] == 1
    assert resp.data['open_demands'] == 1
    assert len(resp.data['recent_sales']) == 1


@pytest.mark.django_db
def test_reports_require_manager_or_admin(client, sales_user):
    client.force_authenticate(user=sales_user)
    resp = client.get('/api/v1/reports/dashboard/')
    assert resp.status_code == 403


@pytest.mark.django_db
def test_pending_payouts_report(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/pending-payouts/')
    assert resp.status_code == 200
    assert resp.data['count'] == 1
    assert resp.data['total'] == '200.00'
    assert resp.data['results'][0]['owner'] == 'Seller One'


@pytest.mark.django_db
def test_sales_report_includes_refunds_and_net_sales(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/sales/')
    assert resp.status_code == 200
    assert resp.data['gross_sales'] == '250.00'
    assert resp.data['refunds'] == '25.00'
    assert resp.data['net_sales'] == '225.00'
    assert resp.data['profit'] == '25.00'


@pytest.mark.django_db
def test_profit_report_groups_by_day(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/profit/?group_by=day')
    assert resp.status_code == 200
    assert resp.data['group_by'] == 'day'
    assert resp.data['total_profit'] == '25.00'
    assert resp.data['results'][0]['period'] == report_data['today'].isoformat()


@pytest.mark.django_db
def test_expense_report_groups_by_category(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/expenses/')
    assert resp.status_code == 200
    assert resp.data['total'] == '450.00'
    assert resp.data['by_category'][0]['category'] == 'Rent'


@pytest.mark.django_db
def test_demand_vs_supply_report(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/demand-vs-supply/')
    assert resp.status_code == 200
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['match_count'] == 1
    assert resp.data['results'][0]['matches'][0]['id'] == report_data['match'].pk


@pytest.mark.django_db
def test_top_requested_report(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/top-requested/')
    assert resp.status_code == 200
    categories = {row['category']: row['count'] for row in resp.data['results']}
    assert categories['Electronics'] == 1
    assert categories['Furniture'] == 1


@pytest.mark.django_db
def test_audit_log_report_filters_by_model(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/audit-log/?model=ReportFixture')
    assert resp.status_code == 200
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['model_name'] == 'ReportFixture'


@pytest.mark.django_db
def test_audit_log_report_filters_by_object_id(client, manager_user, report_data):
    client.force_authenticate(user=manager_user)
    resp = client.get('/api/v1/reports/audit-log/?model=ReportFixture&object_id=1')
    assert resp.status_code == 200
    assert resp.data['count'] == 1

    empty = client.get('/api/v1/reports/audit-log/?model=ReportFixture&object_id=999')
    assert empty.data['count'] == 0
