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
    return User.objects.create_user(username='admin_finance', password='pass', role='ADMIN')


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username='manager_finance', password='pass', role='MANAGER')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='sales_finance', password='pass', role='SALES')


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
