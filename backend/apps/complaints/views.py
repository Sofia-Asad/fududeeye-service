from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import DenyDeleteUnlessAdmin

from .models import Complaint
from .serializers import ComplaintSerializer


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.select_related(
        'customer',
        'related_sale',
        'related_sale__item',
        'assigned_to',
    ).all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'related_sale', 'status', 'priority', 'assigned_to']
    search_fields = ['ticket_number', 'subject', 'description', 'customer__full_name']
    ordering_fields = ['created_at', 'resolved_at', 'status', 'priority']
    ordering = ['-created_at']
