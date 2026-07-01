from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import Category, Item, ItemImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'kind']


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'item', 'image', 'is_primary', 'order']
        read_only_fields = ['item']


class ItemSerializer(serializers.ModelSerializer):
    quantity_available = serializers.IntegerField(read_only=True)
    expected_profit_per_unit = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True, allow_null=True,
    )
    images = ItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category',
            'owner_type', 'owner',
            'owner_asking_price', 'cost_price', 'listed_price',
            'quantity', 'quantity_sold', 'quantity_available',
            'condition', 'location', 'status', 'attributes',
            'expected_profit_per_unit', 'images',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]
        read_only_fields = [
            'quantity_sold', 'created_at', 'updated_at', 'created_by', 'updated_by',
        ]

    def validate(self, attrs):
        # For PATCH, fall back to existing values for fields not in attrs
        def get(field):
            return attrs.get(field, getattr(self.instance, field, None))

        # Build a minimal Item and delegate to clean() — the authoritative source
        temp = Item()
        temp.owner_type = get('owner_type') or ''
        temp.owner = get('owner')      # DRF gives Customer instance; assignment sets owner_id
        temp.owner_asking_price = get('owner_asking_price')
        temp.cost_price = get('cost_price')

        try:
            temp.clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        return attrs
