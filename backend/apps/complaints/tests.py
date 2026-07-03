from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient

from apps.customers.models import Customer
from apps.inventory.models import Category, Item
from apps.sales.models import Sale

from .models import Complaint

User = get_user_model()


@pytest.fixture
def client():
    c = APIClient()
    c.default_format = 'json'
    return c


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='admin_complaints', password='pass', role='ADMIN')


@pytest.fixture
def sales_user(db):
    return User.objects.create_user(username='sales_complaints', password='pass', role='SALES')


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username='manager_complaints', password='pass', role='MANAGER')


@pytest.fixture
def customer(db):
    return Customer.objects.create(full_name='Cabdiraxmaan Nuur', phone='+252 61 800 0001')


@pytest.fixture
def category(db):
    return Category.objects.create(name='Electronics', kind=Category.Kind.ELECTRONICS)


@pytest.fixture
def item(db, category):
    return Item.objects.create(
        title='Company Laptop',
        category=category,
        owner_type=Item.OwnerType.COMPANY,
        cost_price=Decimal('200.00'),
        listed_price=Decimal('300.00'),
    )


@pytest.fixture
def sale(db, item, customer, admin_user):
    return Sale.objects.create(
        item=item,
        buyer=customer,
        quantity_sold=1,
        sale_price=Decimal('300.00'),
        payment_method=Sale.PaymentMethod.CASH,
        handled_by=admin_user,
    )


def complaint_payload(customer, assigned_to=None, related_sale=None):
    payload = {
        'customer': customer.pk,
        'related_sale': related_sale.pk if related_sale else None,
        'subject': 'Laptop battery problem',
        'description': 'Customer reports the battery drains quickly.',
        'priority': Complaint.Priority.HIGH,
        'assigned_to': assigned_to.pk if assigned_to else None,
    }
    return payload


@pytest.mark.django_db
def test_create_complaint(client, admin_user, customer, manager_user):
    client.force_authenticate(user=admin_user)
    resp = client.post('/api/v1/complaints/', complaint_payload(customer, manager_user))
    assert resp.status_code == 201
    assert resp.data['ticket_number'] == 'TKT-00001'
    assert resp.data['status'] == Complaint.Status.OPEN
    assert resp.data['priority'] == Complaint.Priority.HIGH
    assert resp.data['assigned_to'] == manager_user.pk
    assert resp.data['customer_name'] == customer.full_name
    assert resp.data['assigned_to_name'] == manager_user.username


@pytest.mark.django_db
def test_third_complaint_has_ticket_number_tkt_00003(customer):
    Complaint.objects.create(
        customer=customer,
        subject='First',
        description='First complaint',
    )
    Complaint.objects.create(
        customer=customer,
        subject='Second',
        description='Second complaint',
    )
    third = Complaint.objects.create(
        customer=customer,
        subject='Third',
        description='Third complaint',
    )
    assert third.ticket_number == 'TKT-00003'


@pytest.mark.django_db
def test_ticket_number_is_immutable(customer):
    complaint = Complaint.objects.create(
        customer=customer,
        subject='Immutable',
        description='Ticket should not change.',
    )
    complaint.ticket_number = 'TKT-99999'

    with pytest.raises(ValidationError):
        complaint.save()


@pytest.mark.django_db
def test_transition_to_resolved_stamps_resolved_at(client, admin_user, customer):
    complaint = Complaint.objects.create(
        customer=customer,
        subject='Needs resolution',
        description='Complaint should be resolved.',
    )
    assert complaint.resolved_at is None

    client.force_authenticate(user=admin_user)
    resp = client.patch(f'/api/v1/complaints/{complaint.pk}/', {
        'status': Complaint.Status.RESOLVED,
        'resolution_notes': 'Replacement issued.',
    })
    assert resp.status_code == 200
    assert resp.data['status'] == Complaint.Status.RESOLVED
    assert resp.data['resolved_at'] is not None

    complaint.refresh_from_db()
    assert complaint.resolved_at is not None


@pytest.mark.django_db
def test_list_and_filter_complaints(client, admin_user, customer, manager_user):
    Complaint.objects.create(
        customer=customer,
        subject='Open complaint',
        description='Open issue.',
        priority=Complaint.Priority.LOW,
    )
    Complaint.objects.create(
        customer=customer,
        subject='Urgent complaint',
        description='Urgent issue.',
        status=Complaint.Status.IN_PROGRESS,
        priority=Complaint.Priority.URGENT,
        assigned_to=manager_user,
    )

    client.force_authenticate(user=admin_user)
    resp = client.get('/api/v1/complaints/?priority=URGENT')
    assert resp.status_code == 200
    subjects = [c['subject'] for c in resp.data['results']]
    assert subjects == ['Urgent complaint']


@pytest.mark.django_db
def test_complaint_related_sale_display_fields(client, admin_user, customer, sale):
    complaint = Complaint.objects.create(
        customer=customer,
        related_sale=sale,
        subject='Related to sale',
        description='The complaint should expose sale display labels.',
    )

    client.force_authenticate(user=admin_user)
    resp = client.get(f'/api/v1/complaints/{complaint.pk}/')

    assert resp.status_code == 200
    assert resp.data['related_sale_label'] == f'Sale #{sale.pk}'
    assert resp.data['related_sale_item_title'] == sale.item.title


@pytest.mark.django_db
def test_search_complaints_by_ticket_or_subject(client, admin_user, customer):
    complaint = Complaint.objects.create(
        customer=customer,
        subject='Missing charger',
        description='Laptop arrived without charger.',
    )
    Complaint.objects.create(
        customer=customer,
        subject='Screen scratch',
        description='Small scratch on display.',
    )

    client.force_authenticate(user=admin_user)
    by_subject = client.get('/api/v1/complaints/?search=charger')
    assert by_subject.status_code == 200
    assert [c['subject'] for c in by_subject.data['results']] == ['Missing charger']

    by_ticket = client.get(f'/api/v1/complaints/?search={complaint.ticket_number}')
    assert by_ticket.status_code == 200
    assert [c['ticket_number'] for c in by_ticket.data['results']] == [complaint.ticket_number]


@pytest.mark.django_db
def test_related_sale_uses_set_null(customer, sale):
    complaint = Complaint.objects.create(
        customer=customer,
        related_sale=sale,
        subject='Related to sale',
        description='The complaint should survive sale deletion.',
    )

    sale.delete()
    complaint.refresh_from_db()
    assert complaint.related_sale is None


@pytest.mark.django_db
def test_sales_user_can_create_but_cannot_delete_complaint(client, sales_user, customer):
    client.force_authenticate(user=sales_user)
    create_resp = client.post('/api/v1/complaints/', complaint_payload(customer, sales_user))
    assert create_resp.status_code == 201

    complaint_id = create_resp.data['id']
    delete_resp = client.delete(f'/api/v1/complaints/{complaint_id}/')
    assert delete_resp.status_code == 403
    assert Complaint.objects.filter(pk=complaint_id).exists()
