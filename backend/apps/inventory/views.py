from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsManagerOrAbove, IsStaffEditOwn, DenyDeleteUnlessAdmin
from .models import Category, Item, ItemImage
from .serializers import CategorySerializer, ItemSerializer, ItemImageSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['kind', 'parent']
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsManagerOrAbove(), DenyDeleteUnlessAdmin()]


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related('category', 'owner').prefetch_related('images').all()
    serializer_class = ItemSerializer
    permission_classes = [IsStaffEditOwn, DenyDeleteUnlessAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'owner_type', 'owner', 'condition']
    search_fields = ['title', 'description', 'owner__full_name', 'location']
    ordering_fields = ['title', 'listed_price', 'created_at', 'status']
    ordering = ['-created_at']

    @action(
        detail=True,
        methods=['post'],
        url_path='images',
        parser_classes=[MultiPartParser, FormParser],
        permission_classes=[IsStaffEditOwn],
    )
    def upload_image(self, request, pk=None):
        item = self.get_object()
        serializer = ItemImageSerializer(data=request.data)
        if serializer.is_valid():
            is_first_image = not item.images.exists()
            serializer.save(item=item, is_primary=is_first_image)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'images/(?P<image_id>\d+)',
        permission_classes=[IsStaffEditOwn],
    )
    def delete_image(self, request, pk=None, image_id=None):
        item = self.get_object()
        image = get_object_or_404(ItemImage, pk=image_id, item=item)
        was_primary = image.is_primary
        image.delete()
        if was_primary:
            next_image = item.images.order_by('order', 'pk').first()
            if next_image:
                next_image.is_primary = True
                next_image.save(update_fields=['is_primary'])
        return Response(status=status.HTTP_204_NO_CONTENT)
