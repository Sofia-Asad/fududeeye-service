from rest_framework import serializers
from .models import Customer, normalize_phone


class CustomerSerializer(serializers.ModelSerializer):
    is_seller = serializers.BooleanField(read_only=True)
    is_buyer = serializers.BooleanField(read_only=True)

    def validate_phone(self, value):
        normalized = normalize_phone(value)
        if self.instance and normalize_phone(self.instance.phone) == normalized:
            # Unchanged from this customer's own current phone — always allowed,
            # even if that number happens to already be shared by another
            # pre-existing record (e.g. legacy data from before this rule existed).
            return value
        duplicate = Customer.objects.filter(phone_normalized=normalized)
        if self.instance:
            duplicate = duplicate.exclude(pk=self.instance.pk)
        if normalized and duplicate.exists():
            raise serializers.ValidationError('A customer with this phone number already exists.')
        return value

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
