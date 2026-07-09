from django.db.models import ProtectedError
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
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

    def destroy(self, request, *args, **kwargs):
        # Sales/items/demands/complaints all PROTECT their customer FK, so a
        # customer with any history raises ProtectedError instead of deleting.
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'detail': 'This customer has related sales, items, demands, or complaints and cannot be deleted. Deactivate them instead.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
