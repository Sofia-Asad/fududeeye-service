from django.db import models
from django.core.exceptions import ValidationError
from apps.core.models import AuditedModel


class Category(models.Model):
    class Kind(models.TextChoices):
        REAL_ESTATE = 'REAL_ESTATE', 'Real Estate'
        VEHICLE = 'VEHICLE', 'Vehicle'
        ELECTRONICS = 'ELECTRONICS', 'Electronics'
        FURNITURE = 'FURNITURE', 'Furniture'
        GENERIC = 'GENERIC', 'Generic'

    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self',
        null=True, blank=True,
        on_delete=models.PROTECT,
        related_name='children',
    )
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.GENERIC)

    class Meta:
        verbose_name_plural = 'categories'
        unique_together = [('name', 'parent')]
        ordering = ['name']

    def __str__(self):
        return f"{self.parent} > {self.name}" if self.parent_id else self.name


def _item_image_upload_to(instance, filename):
    return f"items/{instance.item_id}/{filename}"


class Item(AuditedModel):
    class OwnerType(models.TextChoices):
        COMPANY = 'COMPANY', 'Company'
        CONSIGNMENT = 'CONSIGNMENT', 'Consignment'

    class Condition(models.TextChoices):
        NEW = 'NEW', 'New'
        USED = 'USED', 'Used'
        REFURBISHED = 'REFURBISHED', 'Refurbished'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        RESERVED = 'RESERVED', 'Reserved'
        SOLD = 'SOLD', 'Sold'
        COMPLETED = 'COMPLETED', 'Completed'
        REFUNDED = 'REFUNDED', 'Refunded'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='items')

    owner_type = models.CharField(max_length=15, choices=OwnerType.choices)
    owner = models.ForeignKey(
        'customers.Customer',
        null=True, blank=True,
        on_delete=models.PROTECT,
        related_name='owned_items',
    )

    # Mutually exclusive per owner_type — enforced by clean()
    owner_asking_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text='Consignment only — locked at intake.',
    )
    cost_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text='Company-owned only — what Fududeeye paid.',
    )
    listed_price = models.DecimalField(max_digits=12, decimal_places=2)

    quantity = models.PositiveIntegerField(default=1)
    quantity_sold = models.PositiveIntegerField(default=0)

    condition = models.CharField(max_length=15, choices=Condition.choices, default=Condition.USED)
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.DRAFT)
    attributes = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def clean(self):
        errors = {}
        if self.owner_type == self.OwnerType.CONSIGNMENT:
            if not self.owner_id:
                errors['owner'] = 'Consignment items must have an owner.'
            if self.owner_asking_price is None:
                errors['owner_asking_price'] = 'Consignment items must have an owner asking price.'
            if self.cost_price is not None:
                errors['cost_price'] = 'Consignment items must not have a cost price.'
        elif self.owner_type == self.OwnerType.COMPANY:
            if self.owner_id:
                errors['owner'] = 'Company-owned items must not have an owner.'
            if self.cost_price is None:
                errors['cost_price'] = 'Company-owned items must have a cost price.'
            if self.owner_asking_price is not None:
                errors['owner_asking_price'] = 'Company-owned items must not have an owner asking price.'
        if errors:
            raise ValidationError(errors)

    @property
    def quantity_available(self):
        return self.quantity - self.quantity_sold

    @property
    def expected_profit_per_unit(self):
        if self.owner_type == self.OwnerType.CONSIGNMENT and self.owner_asking_price is not None:
            return self.listed_price - self.owner_asking_price
        if self.owner_type == self.OwnerType.COMPANY and self.cost_price is not None:
            return self.listed_price - self.cost_price
        return None


class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=_item_image_upload_to)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'pk']

    def __str__(self):
        return f"Image for item {self.item_id} (primary={self.is_primary})"
