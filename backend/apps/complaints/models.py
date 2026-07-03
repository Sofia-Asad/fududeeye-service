from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.core.models import AuditedModel


class Complaint(AuditedModel):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    ticket_number = models.CharField(max_length=20, unique=True, editable=False, blank=True)
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.PROTECT,
        related_name='complaints',
    )
    related_sale = models.ForeignKey(
        'sales.Sale',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='complaints',
    )
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    assigned_to = models.ForeignKey(
        'accounts.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_complaints',
    )
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        ticket = self.ticket_number or 'unsaved'
        return f"{ticket} — {self.subject}"

    def save(self, *args, **kwargs):
        old_status = None
        if self.pk:
            old = type(self).objects.only('ticket_number', 'status').get(pk=self.pk)
            if self.ticket_number != old.ticket_number:
                raise ValidationError({'ticket_number': 'Ticket number is immutable.'})
            old_status = old.status
        elif not self.ticket_number:
            self.ticket_number = self._next_ticket_number()

        became_resolved = (
            self.status == self.Status.RESOLVED
            and old_status != self.Status.RESOLVED
        )
        if became_resolved and self.resolved_at is None:
            self.resolved_at = timezone.now()

        super().save(*args, **kwargs)

    @classmethod
    def _next_ticket_number(cls):
        latest = cls.objects.order_by('-ticket_number').values_list('ticket_number', flat=True).first()
        if not latest:
            return 'TKT-00001'
        try:
            number = int(latest.split('-')[-1])
        except (TypeError, ValueError):
            number = cls.objects.count()
        return f"TKT-{number + 1:05d}"
