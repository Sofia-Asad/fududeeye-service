from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MANAGER = 'MANAGER', 'Manager'
        SALES = 'SALES', 'Sales Staff'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.SALES)
    phone = models.CharField(max_length=30, blank=True)
    is_active_staff = models.BooleanField(default=True)

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_manager(self):
        return self.role == self.Role.MANAGER

    @property
    def can_view_finance(self):
        return self.role in (self.Role.ADMIN, self.Role.MANAGER)

    @property
    def can_delete(self):
        return self.role == self.Role.ADMIN

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
