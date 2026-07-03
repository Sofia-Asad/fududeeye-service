from django.contrib import admin

from .models import Demand


@admin.register(Demand)
class DemandAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'category', 'status', 'target_price_min', 'target_price_max', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'description', 'customer__full_name', 'notes')
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')
    ordering = ('-created_at',)
