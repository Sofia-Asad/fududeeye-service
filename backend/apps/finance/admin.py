from django.contrib import admin

from .models import Expense, ExpenseCategory


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'amount', 'expense_date', 'payment_method', 'created_at')
    list_filter = ('category', 'payment_method', 'expense_date')
    search_fields = ('category__name', 'description', 'notes')
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')
    date_hierarchy = 'expense_date'
    ordering = ('-expense_date', '-created_at')
