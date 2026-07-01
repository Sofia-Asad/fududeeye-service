from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsStaffEditOwn, DenyDeleteUnlessAdmin
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsStaffEditOwn, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['full_name', 'phone', 'alternate_phone', 'email']
    ordering_fields = ['full_name', 'created_at']
    ordering = ['full_name']
