from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    is_seller = serializers.BooleanField(read_only=True)
    is_buyer = serializers.BooleanField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id',
            'full_name',
            'phone',
            'alternate_phone',
            'email',
            'address',
            'notes',
            'is_active',
            'is_seller',
            'is_buyer',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
