import re

from django.db import models
from apps.core.models import AuditedModel


def normalize_phone(value):
    """Strips everything but digits so equivalently-formatted numbers (spaces,
    hyphens, parentheses, a leading +) compare equal for duplicate detection —
    e.g. '061 234 5678' and '061-234-5678' both normalize to '0612345678'."""
    return re.sub(r'\D', '', value or '')


class Customer(AuditedModel):
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, db_index=True)
    # Indexed for fast duplicate lookups in the serializer (see validate_phone
    # in serializers.py). Deliberately NOT a DB-level unique constraint: a
    # handful of existing customers already share a phone number, and this
    # field must not force changes to any existing record. New/edited records
    # are still blocked from creating further duplicates at the API layer.
    phone_normalized = models.CharField(max_length=30, db_index=True, null=True, blank=True, editable=False)
    alternate_phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name

    def save(self, *args, **kwargs):
        self.phone_normalized = normalize_phone(self.phone) or None
        super().save(*args, **kwargs)

    @property
    def is_seller(self):
        # True once inventory app defines Item.owner → Customer (related_name='owned_items')
        return hasattr(self, 'owned_items') and self.owned_items.exists()

    @property
    def is_buyer(self):
        # True once sales app defines Sale.buyer → Customer (related_name='purchases')
        return hasattr(self, 'purchases') and self.purchases.exists()
