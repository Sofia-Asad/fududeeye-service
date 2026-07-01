import datetime
from decimal import Decimal
from django.db import models, transaction
from apps.core.models import AuditedModel


class Sale(AuditedModel):
    class PayoutStatus(models.TextChoices):
        NA = 'NA', 'N/A'
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'

    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Cash'
        EVC_PLUS = 'EVC_PLUS', 'EVC Plus'
        ZAAD = 'ZAAD', 'Zaad'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        OTHER = 'OTHER', 'Other'

    item = models.ForeignKey(
        'inventory.Item', on_delete=models.PROTECT, related_name='sales',
    )
    buyer = models.ForeignKey(
        'customers.Customer', on_delete=models.PROTECT, related_name='purchases',
    )
    quantity_sold = models.PositiveIntegerField(default=1)
    # Total price for the whole sale, not per unit
    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    sale_date = models.DateField(default=datetime.date.today)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    handled_by = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT, related_name='handled_sales',
    )
    notes = models.TextField(blank=True)

    # Computed at creation time by save() — never mutated after that
    owner_payout_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'),
        help_text='0 for company items; owner_asking_price × qty for consignment.',
    )
    company_profit = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'),
    )

    # Payout tracking — updated via mark-paid action, not during initial save
    payout_status = models.CharField(
        max_length=10, choices=PayoutStatus.choices, default=PayoutStatus.NA,
    )
    payout_method = models.CharField(max_length=20, choices=PaymentMethod.choices, blank=True)
    payout_date = models.DateField(null=True, blank=True)
    payout_handled_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='payout_handled_sales',
    )

    class Meta:
        ordering = ['-sale_date', '-created_at']

    def __str__(self):
        return f"Sale #{self.pk} — {self.item} × {self.quantity_sold}"

    @transaction.atomic
    def save(self, *args, **kwargs):
        # Compute amounts ONLY on the initial INSERT.
        # Belt-and-suspenders: guard on both pk AND update_fields so a
        # partial save (mark-paid, admin inline) can never enter the
        # calculation branch even if pk somehow hasn't been assigned yet.
        is_insert = self.pk is None and not kwargs.get('update_fields')
        if is_insert:
            self._compute_and_persist(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def _compute_and_persist(self, *args, **kwargs):
        from apps.inventory.models import Item

        item = Item.objects.get(pk=self.item_id)

        if item.owner_type == 'CONSIGNMENT':
            self.owner_payout_amount = item.owner_asking_price * self.quantity_sold
            self.payout_status = self.PayoutStatus.PENDING
            self.company_profit = self.sale_price - self.owner_payout_amount
        else:  # COMPANY
            self.owner_payout_amount = Decimal('0.00')
            self.payout_status = self.PayoutStatus.NA
            self.company_profit = self.sale_price - (item.cost_price * self.quantity_sold)

        super().save(*args, **kwargs)

        # Bump quantity_sold directly — bypass Item.save() and audit signals
        # since this is a system side-effect, not a user-initiated item edit.
        Item.objects.filter(pk=item.pk).update(
            quantity_sold=models.F('quantity_sold') + self.quantity_sold
        )
        item.refresh_from_db(fields=['quantity_sold'])
        if item.quantity_sold >= item.quantity:
            Item.objects.filter(pk=item.pk).update(status='SOLD')


class Refund(AuditedModel):
    class Reason(models.TextChoices):
        DEFECTIVE = 'DEFECTIVE', 'Defective Item'
        WRONG_ITEM = 'WRONG_ITEM', 'Wrong Item'
        BUYER_CHANGED_MIND = 'BUYER_CHANGED_MIND', 'Buyer Changed Mind'
        OTHER = 'OTHER', 'Other'

    # PROTECT so Sale history is never silently broken
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name='refunds')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=25, choices=Reason.choices)
    reason_detail = models.TextField(blank=True)
    refund_date = models.DateField(default=datetime.date.today)
    item_returned = models.BooleanField(default=False)
    refund_method = models.CharField(max_length=20, choices=Sale.PaymentMethod.choices)
    handled_by = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT, related_name='handled_refunds',
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-refund_date', '-created_at']

    def __str__(self):
        return f"Refund #{self.pk} for Sale #{self.sale_id} — ${self.amount}"
