from django.contrib import admin

from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['id', 'kind', 'full_name', 'phone', 'status', 'item', 'created_at']
    list_filter = ['kind', 'status']
    search_fields = ['full_name', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at']
