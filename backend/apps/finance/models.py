import datetime

from django.db import models

from apps.core.models import AuditedModel


class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'expense categories'
        ordering = ['name']

    def __str__(self):
        return self.name


def _receipt_upload_to(instance, filename):
    return f"expenses/receipts/{instance.expense_date:%Y/%m}/{filename}"


class Expense(AuditedModel):
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Cash'
        EVC_PLUS = 'EVC_PLUS', 'EVC Plus'
        ZAAD = 'ZAAD', 'Zaad'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        OTHER = 'OTHER', 'Other'

    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        related_name='expenses',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField(default=datetime.date.today)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    description = models.TextField()
    receipt = models.ImageField(upload_to=_receipt_upload_to, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']

    def __str__(self):
        return f"{self.category} — ${self.amount} on {self.expense_date}"
