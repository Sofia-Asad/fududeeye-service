from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimestampedModel


class Inquiry(TimestampedModel):
    """A lead from an anonymous public-marketplace visitor — not a staff-audited record."""

    class Kind(models.TextChoices):
        ITEM_INTEREST = 'ITEM_INTEREST', 'Item Interest'
        ITEM_REQUEST = 'ITEM_REQUEST', 'Item Request'
        GENERAL = 'GENERAL', 'General Inquiry'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        CONTACTED = 'CONTACTED', 'Contacted'
        CLOSED = 'CLOSED', 'Closed'

    kind = models.CharField(max_length=15, choices=Kind.choices)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    message = models.TextField(blank=True)

    # ITEM_INTEREST: which listing they're asking about.
    item = models.ForeignKey(
        'inventory.Item',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='inquiries',
    )
    # ITEM_REQUEST: what they're looking for (a short name) and an optional category hint.
    item_needed = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(
        'inventory.Category',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='requested_in_inquiries',
    )

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.NEW)
    handled_by = models.ForeignKey(
        'accounts.User',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='handled_inquiries',
    )
    staff_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'inquiries'

    def __str__(self):
        return f"{self.get_kind_display()} from {self.full_name} ({self.status})"

    def clean(self):
        errors = {}
        if self.kind == self.Kind.ITEM_INTEREST and not self.item_id:
            errors['item'] = 'Item interest inquiries must reference an item.'
        if self.kind == self.Kind.ITEM_REQUEST and not self.item_needed:
            errors['item_needed'] = 'Item request inquiries must say what is needed.'
        if self.kind == self.Kind.GENERAL and not self.message:
            errors['message'] = 'General inquiries must include a message.'
        if errors:
            raise ValidationError(errors)
