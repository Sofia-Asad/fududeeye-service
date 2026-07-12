from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from .models import Expense, ExpenseCategory

User = get_user_model()


@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='admin_finance', password='pass', role='ADMIN', email='admin_finance@fududeeye.local')


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username='manager_finance', password='pass', role='MANAGER', email='manager_finance@fududeeye.local')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='sales_finance', password='pass', role='SALES', email='sales_finance@fududeeye.local')


@pytest.fixture
def category(db):
    return ExpenseCategory.objects.create(name='Rent', description='Shop rent')


def expense_payload(category):
    return {
        'category': category.pk,
        'amount': '450.00',
        'expense_date': '2026-07-01',
        'payment_method': Expense.PaymentMethod.BANK_TRANSFER,
        'description': 'Shop rent — July',
        'notes': 'Paid on time.',
    }


@pytest.mark.django_db
def test_create_expense_category(client, manager_user):
    client.force_authenticate(user=manager_user)
    resp = client.post('/api/v1/expense-categories/', {
        'name': 'Utilities',
        'description': 'Power, internet, and water',
    })
    assert resp.status_code == 201
    assert resp.data['name'] == 'Utilities'
    assert resp.data['is_active'] is True


@pytest.mark.django_db
def test_create_expense(client, manager_user, category):
    client.force_authenticate(user=manager_user)
    resp = client.post('/api/v1/expenses/', expense_payload(category))
    assert resp.status_code == 201
    assert resp.data['category_name'] == category.name
    assert resp.data['amount'] == '450.00'
    assert resp.data['payment_method'] == Expense.PaymentMethod.BANK_TRANSFER
    assert Expense.objects.filter(pk=resp.data['id']).exists()


@pytest.mark.django_db
def test_sales_user_gets_403_listing_expenses(client, sales_user):
    client.force_authenticate(user=sales_user)
    resp = client.get('/api/v1/expenses/')
    assert resp.status_code == 403


@pytest.mark.django_db
def test_sales_user_gets_403_listing_expense_categories(client, sales_user):
    client.force_authenticate(user=sales_user)
    resp = client.get('/api/v1/expense-categories/')
    assert resp.status_code == 403


@pytest.mark.django_db
def test_filter_expenses_by_payment_method(client, admin_user, category):
    Expense.objects.create(
        category=category,
        amount=Decimal('450.00'),
        expense_date='2026-07-01',
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )
    Expense.objects.create(
        category=category,
        amount=Decimal('35.00'),
        expense_date='2026-07-02',
        payment_method=Expense.PaymentMethod.CASH,
        description='Delivery fuel',
    )

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/expenses/?payment_method=CASH')
    assert resp.status_code == 200
    descriptions = [e['description'] for e in resp.data['results']]
    assert descriptions == ['Delivery fuel']


@pytest.mark.django_db
def test_filter_expenses_by_date_range(client, admin_user, category):
    Expense.objects.create(
        category=category,
        amount=Decimal('450.00'),
        expense_date='2026-07-01',
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )
    Expense.objects.create(
        category=category,
        amount=Decimal('35.00'),
        expense_date='2026-08-01',
        payment_method=Expense.PaymentMethod.CASH,
        description='Delivery fuel',
    )

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/expenses/?start=2026-07-01&end=2026-07-31')
    assert resp.status_code == 200
    descriptions = [e['description'] for e in resp.data['results']]
    assert descriptions == ['Shop rent']


@pytest.mark.django_db
def test_search_expenses_by_description(client, admin_user, category):
    Expense.objects.create(
        category=category,
        amount=Decimal('450.00'),
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )
    Expense.objects.create(
        category=category,
        amount=Decimal('120.00'),
        payment_method=Expense.PaymentMethod.CASH,
        description='Generator diesel',
    )

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/expenses/?search=diesel')
    assert resp.status_code == 200
    descriptions = [e['description'] for e in resp.data['results']]
    assert descriptions == ['Generator diesel']


@pytest.mark.django_db
def test_expense_history_tracks_changes(client, manager_user, category):
    client.force_authenticate(user=manager_user)
    create_resp = client.post('/api/v1/expenses/', expense_payload(category))
    expense_id = create_resp.data['id']

    client.patch(f'/api/v1/expenses/{expense_id}/', {'amount': '500.00'})

    resp = client.get(f'/api/v1/expenses/{expense_id}/history/')
    assert resp.status_code == 200
    actions = [row['action'] for row in resp.data['results']]
    assert 'CREATE' in actions
    assert 'UPDATE' in actions
    update_row = next(row for row in resp.data['results'] if row['action'] == 'UPDATE')
    assert update_row['changes']['amount'] == {'old': '450.00', 'new': '500.00'}


@pytest.mark.django_db
def test_sales_user_gets_403_reading_expense_history(client, sales_user, manager_user, category):
    client.force_authenticate(user=manager_user)
    create_resp = client.post('/api/v1/expenses/', expense_payload(category))
    expense_id = create_resp.data['id']

    client.force_authenticate(user=sales_user)
    resp = client.get(f'/api/v1/expenses/{expense_id}/history/')
    assert resp.status_code == 403


@pytest.mark.django_db
def test_manager_cannot_delete_expense(client, manager_user, category):
    expense = Expense.objects.create(
        category=category,
        amount=Decimal('450.00'),
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )

    client.force_authenticate(user=manager_user)
    resp = client.delete(f'/api/v1/expenses/{expense.pk}/')
    assert resp.status_code == 403
    assert Expense.objects.filter(pk=expense.pk).exists()


# --- business rule: delete expense ---

@pytest.mark.django_db
def test_admin_can_delete_expense(client, admin_user, category):
    expense = Expense.objects.create(
        category=category,
        amount=Decimal('450.00'),
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )
    other = Expense.objects.create(
        category=category,
        amount=Decimal('35.00'),
        payment_method=Expense.PaymentMethod.CASH,
        description='Delivery fuel',
    )

    client.force_authenticate(user=admin_user)
    resp = client.delete(f'/api/v1/expenses/{expense.pk}/')
    assert resp.status_code == 204
    assert not Expense.objects.filter(pk=expense.pk).exists()
    # Only the targeted record is removed — everything else is untouched.
    assert Expense.objects.filter(pk=other.pk).exists()
    assert Expense.objects.count() == 1


@pytest.mark.django_db
def test_sales_user_cannot_delete_expense(client, sales_user, category):
    expense = Expense.objects.create(
        category=category,
        amount=Decimal('450.00'),
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )

    client.force_authenticate(user=sales_user)
    resp = client.delete(f'/api/v1/expenses/{expense.pk}/')
    assert resp.status_code == 403
    assert Expense.objects.filter(pk=expense.pk).exists()


@pytest.mark.django_db
def test_anonymous_cannot_delete_expense(client, category):
    expense = Expense.objects.create(
        category=category,
        amount=Decimal('450.00'),
        payment_method=Expense.PaymentMethod.BANK_TRANSFER,
        description='Shop rent',
    )

    resp = client.delete(f'/api/v1/expenses/{expense.pk}/')
    assert resp.status_code in (401, 403)
    assert Expense.objects.filter(pk=expense.pk).exists()


@pytest.mark.django_db
def test_delete_nonexistent_expense_returns_404(client, admin_user):
    client.force_authenticate(user=admin_user)
    resp = client.delete('/api/v1/expenses/999999/')
    assert resp.status_code == 404


@pytest.mark.django_db
def test_deleted_expense_excluded_from_report_totals(client, admin_user, category):
    """Covers the "derived financial summaries update correctly" requirement
    at the API level the frontend reports/dashboard actually read from."""
    keep = Expense.objects.create(
        category=category,
        amount=Decimal('100.00'),
        expense_date='2026-07-01',
        payment_method=Expense.PaymentMethod.CASH,
        description='Keep me',
    )
    to_delete = Expense.objects.create(
        category=category,
        amount=Decimal('250.00'),
        expense_date='2026-07-02',
        payment_method=Expense.PaymentMethod.CASH,
        description='Delete me',
    )

    client.force_authenticate(user=admin_user)

    before = client.get('/api/v1/reports/expenses/?start=2026-07-01&end=2026-07-31')
    assert before.status_code == 200
    assert Decimal(before.data['total']) == Decimal('350.00')

    del_resp = client.delete(f'/api/v1/expenses/{to_delete.pk}/')
    assert del_resp.status_code == 204

    after = client.get('/api/v1/reports/expenses/?start=2026-07-01&end=2026-07-31')
    assert after.status_code == 200
    assert Decimal(after.data['total']) == Decimal('100.00')
    assert Expense.objects.filter(pk=keep.pk).exists()
