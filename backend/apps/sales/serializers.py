from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Sale, Refund

User = get_user_model()


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = [
            'id', 'item', 'buyer', 'quantity_sold', 'sale_price',
            'sale_date', 'payment_method', 'handled_by', 'notes',
            'owner_payout_amount', 'company_profit',
            'payout_status', 'payout_method', 'payout_date', 'payout_handled_by',
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
