import django_filters
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import DenyDeleteUnlessAdmin
from apps.customers.models import Customer
from apps.demands.models import Demand
from apps.inventory.models import Category, Item

from .models import Inquiry
from .serializers import (
    InquiryCreateSerializer,
    InquirySerializer,
    PublicCategorySerializer,
    PublicItemSerializer,
)
from .throttles import InquiryCreateThrottle


class PublicItemFilterSet(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name='listed_price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='listed_price', lookup_expr='lte')

    class Meta:
        model = Item
        fields = ['category', 'condition', 'price_min', 'price_max']


class PublicCategoryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Read-only category browsing for the public marketplace — no auth required."""

    queryset = (
        Category.objects.annotate(
            active_item_count=Count('items', filter=Q(items__status=Item.Status.ACTIVE)),
        )
        .order_by('name')
    )
    serializer_class = PublicCategorySerializer
    permission_classes = [AllowAny]


class PublicItemViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Read-only listing browsing for the public marketplace — ACTIVE items only, no auth required."""

    queryset = (
        Item.objects.filter(status=Item.Status.ACTIVE)
        .select_related('category')
        .prefetch_related('images')
    )
    serializer_class = PublicItemSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PublicItemFilterSet
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['listed_price', 'created_at']
    ordering = ['-created_at']


class InquiryViewSet(viewsets.ModelViewSet):
    """Public POST to capture a lead; staff-only for listing/updating/handling leads."""

    queryset = Inquiry.objects.select_related('item', 'category', 'handled_by').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['kind', 'status']
    search_fields = ['full_name', 'phone', 'email']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return InquiryCreateSerializer
        return InquirySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        if self.action == 'destroy':
            return [IsAuthenticated(), DenyDeleteUnlessAdmin()]
        return [IsAuthenticated()]

    def get_throttles(self):
        if self.action == 'create':
            return [InquiryCreateThrottle()]
        return []

    @action(detail=True, methods=['post'], url_path='convert')
    def convert(self, request, pk=None):
        """Turn a lead into a real Customer (and, for item requests, a Demand)."""
        inquiry = self.get_object()

        customer, created = Customer.objects.get_or_create(
            phone=inquiry.phone,
            defaults={'full_name': inquiry.full_name, 'email': inquiry.email},
        )

        demand = None
        if inquiry.kind == Inquiry.Kind.ITEM_REQUEST:
            demand = Demand.objects.create(
                customer=customer,
                title=inquiry.item_needed,
                description=inquiry.message,
                category=inquiry.category,
            )

        if inquiry.status == Inquiry.Status.NEW:
            inquiry.status = Inquiry.Status.CONTACTED
        if not inquiry.handled_by_id:
            inquiry.handled_by = request.user
        inquiry.save()

        return Response(
            {
                'customer_id': customer.id,
                'customer_created': created,
                'demand_id': demand.id if demand else None,
            },
            status=status.HTTP_200_OK,
        )
