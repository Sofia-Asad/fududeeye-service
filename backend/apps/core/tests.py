from io import StringIO

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from apps.complaints.models import Complaint
from apps.core.models import AuditLog
from apps.customers.models import Customer
from apps.demands.models import Demand
from apps.finance.models import Expense
from apps.inventory.models import Item
from apps.sales.models import Refund, Sale


User = get_user_model()


def demo_counts():
    return {
        'users': User.objects.filter(username__startswith='demo_').count(),
        'customers': Customer.objects.count(),
        'items': Item.objects.count(),
        'sales': Sale.objects.filter(notes__contains='DEMO:').count(),
        'refunds': Refund.objects.filter(notes__contains='DEMO:').count(),
        'demands': Demand.objects.count(),
        'complaints': Complaint.objects.count(),
        'expenses': Expense.objects.count(),
        'audit_logs': AuditLog.objects.count(),
    }


@pytest.mark.django_db
def test_seed_demo_data_creates_workflow_cases_and_is_idempotent():
    call_command('seed_demo_data', stdout=StringIO())
    first_counts = demo_counts()

    assert first_counts['users'] == 5
    assert first_counts['customers'] == 6
    assert first_counts['items'] == 8
    assert first_counts['sales'] == 5
    assert first_counts['refunds'] == 1
    assert first_counts['demands'] == 4
    assert first_counts['complaints'] == 4
    assert first_counts['expenses'] == 6
    assert Sale.objects.filter(payout_status=Sale.PayoutStatus.PENDING).count() == 2
    assert Sale.objects.filter(payout_status=Sale.PayoutStatus.PAID).count() == 1
    assert Sale.objects.filter(payout_status=Sale.PayoutStatus.NA).count() == 2

    demo_admin = User.objects.get(username='demo_admin')
    assert demo_admin.check_password('demo12345')
    assert demo_admin.is_admin is True

    call_command('seed_demo_data', stdout=StringIO())
    assert demo_counts() == first_counts
