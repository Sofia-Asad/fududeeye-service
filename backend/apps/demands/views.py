from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import DenyDeleteUnlessAdmin, IsStaffEditOwn
from apps.core.models import AuditLog
from apps.core.serializers import serialize_audit_logs
from apps.inventory.serializers import ItemSerializer

from .models import Demand
from .serializers import DemandSerializer


class DemandViewSet(viewsets.ModelViewSet):
    queryset = Demand.objects.select_related('customer', 'category', 'matched_item').all()
    serializer_class = DemandSerializer
    permission_classes = [IsStaffEditOwn, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'category', 'status', 'matched_item']
    search_fields = ['title', 'description', 'customer__full_name', 'notes']
    ordering_fields = ['created_at', 'target_price_min', 'target_price_max', 'status']
    ordering = ['-created_at']

    @action(detail=True, methods=['get'], url_path='suggested-matches')
    def suggested_matches(self, request, pk=None):
        demand = self.get_object()
        serializer = ItemSerializer(demand.suggest_matches(), many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        demand = self.get_object()
        logs = AuditLog.objects.filter(model_name='Demand', object_id=str(demand.pk)).select_related('user')
        return Response({'results': serialize_audit_logs(logs)})
