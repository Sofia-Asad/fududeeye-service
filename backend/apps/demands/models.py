from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import AuditedModel


class Demand(AuditedModel):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        MATCHED = 'MATCHED', 'Matched'
        FULFILLED = 'FULFILLED', 'Fulfilled'
        DROPPED = 'DROPPED', 'Dropped'

    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.PROTECT,
        related_name='demands',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        'inventory.Category',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='demands',
    )
    target_price_min = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    target_price_max = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    matched_item = models.ForeignKey(
        'inventory.Item',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='matched_demands',
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.customer}"

    def clean(self):
        if (
            self.target_price_min is not None
            and self.target_price_max is not None
            and self.target_price_min > self.target_price_max
        ):
            raise ValidationError({
                'target_price_max': 'Maximum target price must be greater than or equal to minimum target price.',
            })

    def suggest_matches(self):
        from apps.inventory.models import Item

        matches = Item.objects.filter(status=Item.Status.ACTIVE)
        if self.category_id:
            matches = matches.filter(category_id=self.category_id)
        if self.target_price_min is not None:
            matches = matches.filter(listed_price__gte=self.target_price_min)
        if self.target_price_max is not None:
            matches = matches.filter(listed_price__lte=self.target_price_max)
        return matches.order_by('listed_price', 'title')
