from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.inventory.models import Category, Item, ItemImage

from .models import Inquiry


class PublicCategorySerializer(serializers.ModelSerializer):
    active_item_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'kind', 'active_item_count']


class PublicItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image', 'is_primary', 'order']


class PublicItemSerializer(serializers.ModelSerializer):
    """Read-only, public-safe view of an Item — no cost/asking price or owner identity."""

    category_name = serializers.CharField(source='category.name', read_only=True)
    category_kind = serializers.CharField(source='category.kind', read_only=True)
    images = PublicItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'category_name', 'category_kind',
            'listed_price', 'condition', 'location', 'attributes', 'images', 'created_at',
        ]


class InquiryCreateSerializer(serializers.ModelSerializer):
    """What an anonymous marketplace visitor may submit — no status/staff fields."""

    class Meta:
        model = Inquiry
        fields = ['kind', 'full_name', 'phone', 'email', 'message', 'item', 'item_needed', 'category']

    def validate_item(self, item):
        if item is not None and item.status != Item.Status.ACTIVE:
            raise serializers.ValidationError('This item is not currently available.')
        return item

    def validate(self, attrs):
        instance = Inquiry(**attrs)
        try:
            instance.clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)
        return attrs


class InquirySerializer(serializers.ModelSerializer):
    """Staff-facing view for managing leads in the CRM."""

    item_title = serializers.CharField(source='item.title', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    handled_by_name = serializers.CharField(source='handled_by.get_full_name', read_only=True, allow_null=True)
    # Listing details for an ITEM_INTEREST lead — sourced from the linked Item, not
    # duplicated onto Inquiry, so the CRM card can show category/price/owner.
    item_category_name = serializers.CharField(source='item.category.name', read_only=True, allow_null=True)
    item_listed_price = serializers.DecimalField(source='item.listed_price', read_only=True, allow_null=True, max_digits=12, decimal_places=2)
    item_owner_type = serializers.CharField(source='item.owner_type', read_only=True, allow_null=True)
    item_owner_name = serializers.CharField(source='item.owner.full_name', read_only=True, allow_null=True)
    item_status = serializers.CharField(source='item.status', read_only=True, allow_null=True)
    item_image = serializers.SerializerMethodField()

    class Meta:
        model = Inquiry
        fields = [
            'id', 'kind', 'full_name', 'phone', 'email', 'message',
            'item', 'item_title', 'item_needed', 'category', 'category_name',
            'item_category_name', 'item_listed_price', 'item_owner_type', 'item_owner_name',
            'item_status', 'item_image',
            'status', 'handled_by', 'handled_by_name', 'staff_notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'kind', 'full_name', 'phone', 'email', 'message', 'item', 'item_needed', 'category',
            'created_at', 'updated_at',
        ]

    def get_item_image(self, obj):
        if obj.item_id is None:
            return None
        image = obj.item.images.filter(is_primary=True).first() or obj.item.images.first()
        if not image:
            return None
        request = self.context.get('request')
        url = image.image.url
        return request.build_absolute_uri(url) if request else url
