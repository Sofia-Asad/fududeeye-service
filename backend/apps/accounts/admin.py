from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('CRM', {'fields': ('role', 'phone', 'is_active_staff')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active_staff')
    list_filter = UserAdmin.list_filter + ('role',)
