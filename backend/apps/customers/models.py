from django.db import models
from apps.core.models import AuditedModel


class Customer(AuditedModel):
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, db_index=True)
    alternate_phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name

    @property
    def is_seller(self):
        # True once inventory app defines Item.owner → Customer (related_name='owned_items')
        return hasattr(self, 'owned_items') and self.owned_items.exists()

    @property
    def is_buyer(self):
        # True once sales app defines Sale.buyer → Customer (related_name='purchases')
        return hasattr(self, 'purchases') and self.purchases.exists()
