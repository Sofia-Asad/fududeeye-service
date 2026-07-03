from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Demand


class DemandSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    matched_item_title = serializers.CharField(source='matched_item.title', read_only=True, allow_null=True)

    class Meta:
        model = Demand
        fields = [
            'id',
            'customer',
            'customer_name',
            'title',
            'description',
            'category',
            'category_name',
            'target_price_min',
            'target_price_max',
            'status',
            'matched_item',
            'matched_item_title',
            'notes',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']

    def validate(self, attrs):
        def get(field):
            return attrs.get(field, getattr(self.instance, field, None))

        temp = Demand(
            target_price_min=get('target_price_min'),
            target_price_max=get('target_price_max'),
        )

        try:
            temp.clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        return attrs
