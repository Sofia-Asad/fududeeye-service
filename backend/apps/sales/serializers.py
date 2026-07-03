from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Sale, Refund

User = get_user_model()


class SaleSerializer(serializers.ModelSerializer):
    item_title = serializers.CharField(source='item.title', read_only=True)
    item_owner_type = serializers.CharField(source='item.owner_type', read_only=True)
    item_owner_name = serializers.CharField(source='item.owner.full_name', read_only=True, allow_null=True)
    item_listed_price = serializers.DecimalField(
        source='item.listed_price',
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    item_owner_asking_price = serializers.DecimalField(
        source='item.owner_asking_price',
        max_digits=12,
        decimal_places=2,
        read_only=True,
        allow_null=True,
    )
    item_cost_price = serializers.DecimalField(
        source='item.cost_price',
        max_digits=12,
        decimal_places=2,
        read_only=True,
        allow_null=True,
    )
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    handled_by_name = serializers.CharField(source='handled_by.username', read_only=True)
    payout_handled_by_name = serializers.CharField(
        source='payout_handled_by.username',
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Sale
        fields = [
            'id',
            'item', 'item_title', 'item_owner_type', 'item_owner_name',
            'item_listed_price', 'item_owner_asking_price', 'item_cost_price',
            'buyer', 'buyer_name', 'quantity_sold', 'sale_price',
            'sale_date', 'payment_method', 'handled_by', 'handled_by_name', 'notes',
            'owner_payout_amount', 'company_profit',
            'payout_status', 'payout_method', 'payout_date',
            'payout_handled_by', 'payout_handled_by_name',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]
        read_only_fields = [
            'owner_payout_amount', 'company_profit',
            'payout_status', 'payout_method', 'payout_date', 'payout_handled_by',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]

    def validate(self, attrs):
        item = attrs.get('item')
        qty = attrs.get('quantity_sold', 1)
        if item is not None and qty > item.quantity_available:
            raise serializers.ValidationError({
                'quantity_sold': (
                    f'Only {item.quantity_available} unit(s) available for this item.'
                ),
            })
        return attrs


class MarkPaidSerializer(serializers.Serializer):
    payout_method = serializers.ChoiceField(choices=Sale.PaymentMethod.choices)
    payout_date = serializers.DateField()
    payout_handled_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = [
            'id', 'sale', 'amount', 'reason', 'reason_detail',
            'refund_date', 'item_returned', 'refund_method', 'handled_by', 'notes',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
