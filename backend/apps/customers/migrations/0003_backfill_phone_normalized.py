import re

from django.db import migrations


def normalize_phone(value):
    return re.sub(r'\D', '', value or '')


def backfill_phone_normalized(apps, schema_editor):
    Customer = apps.get_model('customers', 'Customer')
    for customer in Customer.objects.all():
        customer.phone_normalized = normalize_phone(customer.phone) or None
        customer.save(update_fields=['phone_normalized'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0002_customer_phone_normalized'),
    ]

    operations = [
        migrations.RunPython(backfill_phone_normalized, noop_reverse),
    ]
