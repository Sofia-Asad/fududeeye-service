from django.contrib import admin

from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        'ticket_number',
        'customer',
        'subject',
        'status',
        'priority',
        'assigned_to',
        'resolved_at',
        'created_at',
    )
    list_filter = ('status', 'priority', 'assigned_to')
    search_fields = ('ticket_number', 'subject', 'description', 'customer__full_name')
    readonly_fields = (
        'ticket_number',
        'resolved_at',
        'created_by',
        'updated_by',
        'created_at',
        'updated_at',
    )
    ordering = ('-created_at',)
