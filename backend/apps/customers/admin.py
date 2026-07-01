from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'email', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('full_name', 'phone', 'alternate_phone', 'email')
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')
    ordering = ('full_name',)
