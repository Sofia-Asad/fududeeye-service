from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsManagerOrAbove, IsStaffEditOwn, DenyDeleteUnlessAdmin
from .models import Sale, Refund
from .serializers import SaleSerializer, MarkPaidSerializer, RefundSerializer


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related(
        'item',
        'item__owner',
        'buyer',
        'handled_by',
        'payout_handled_by',
    ).all()
    serializer_class = SaleSerializer
    permission_classes = [IsStaffEditOwn, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['item', 'buyer', 'handled_by', 'payment_method', 'payout_status']
    search_fields = ['item__title', 'buyer__full_name', 'notes']
    ordering_fields = ['sale_date', 'sale_price', 'created_at']
    ordering = ['-sale_date', '-created_at']

    @action(
        detail=True,
        methods=['post'],
        url_path='mark-paid',
        permission_classes=[IsManagerOrAbove],
    )
    def mark_paid(self, request, pk=None):
        sale = self.get_object()
        if sale.payout_status != Sale.PayoutStatus.PENDING:
            return Response(
                {'detail': 'Only PENDING payouts can be marked as paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = MarkPaidSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        sale.payout_status = Sale.PayoutStatus.PAID
        sale.payout_method = serializer.validated_data['payout_method']
        sale.payout_date = serializer.validated_data['payout_date']
        sale.payout_handled_by = serializer.validated_data['payout_handled_by']
        sale.save(update_fields=['payout_status', 'payout_method', 'payout_date', 'payout_handled_by'])
        # Re-fetch from DB so the response always reflects stored truth,
        # not the in-memory instance whose related-object caches may be stale.
        sale.refresh_from_db()
        return Response(SaleSerializer(sale).data)


class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.select_related('sale', 'handled_by').all()
    serializer_class = RefundSerializer
    permission_classes = [IsStaffEditOwn, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sale', 'handled_by', 'reason', 'item_returned']
    search_fields = ['sale__item__title', 'reason_detail', 'notes']
    ordering_fields = ['refund_date', 'amount', 'created_at']
    ordering = ['-refund_date', '-created_at']
