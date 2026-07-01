from django.contrib import admin
from .models import Sale, Refund


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    fields = ('amount', 'reason', 'refund_date', 'item_returned', 'refund_method', 'handled_by')
    readonly_fields = ('created_at',)


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'item', 'buyer', 'quantity_sold', 'sale_price',
        'sale_date', 'payment_method', 'payout_status', 'handled_by',
    )
    list_filter = ('payment_method', 'payout_status', 'sale_date')
    search_fields = ('item__title', 'buyer__full_name', 'handled_by__username', 'notes')
    readonly_fields = (
        'owner_payout_amount', 'company_profit',
        'created_by', 'updated_by', 'created_at', 'updated_at',
    )
    inlines = [RefundInline]
    date_hierarchy = 'sale_date'


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('id', 'sale', 'amount', 'reason', 'refund_date', 'item_returned', 'handled_by')
    list_filter = ('reason', 'item_returned', 'refund_date')
    search_fields = ('sale__item__title', 'reason_detail', 'notes')
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')
    date_hierarchy = 'refund_date'
