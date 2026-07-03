from rest_framework import serializers

from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    related_sale_label = serializers.SerializerMethodField()
    related_sale_item_title = serializers.CharField(
        source='related_sale.item.title',
        read_only=True,
        allow_null=True,
    )
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'ticket_number',
            'customer',
            'customer_name',
            'related_sale',
            'related_sale_label',
            'related_sale_item_title',
            'subject',
            'description',
            'status',
            'priority',
            'assigned_to',
            'assigned_to_name',
            'resolution_notes',
            'resolved_at',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]

    def get_related_sale_label(self, obj):
        if not obj.related_sale_id:
            return None
        return f"Sale #{obj.related_sale_id}"
        read_only_fields = [
            'ticket_number',
            'resolved_at',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
