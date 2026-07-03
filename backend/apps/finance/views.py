from django_filters.rest_framework import DjangoFilterBackend
from django.utils.dateparse import parse_date
from rest_framework import filters, viewsets

from apps.accounts.permissions import DenyDeleteUnlessAdmin, IsFinanceViewer

from .models import Expense, ExpenseCategory
from .serializers import ExpenseCategorySerializer, ExpenseSerializer


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsFinanceViewer, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('category').all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsFinanceViewer, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'payment_method', 'expense_date']
    search_fields = ['category__name', 'description', 'notes']
    ordering_fields = ['expense_date', 'amount', 'created_at']
    ordering = ['-expense_date', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        start = parse_date(self.request.query_params.get('start') or '')
        end = parse_date(self.request.query_params.get('end') or '')
        if start:
            queryset = queryset.filter(expense_date__gte=start)
        if end:
            queryset = queryset.filter(expense_date__lte=end)
        return queryset
