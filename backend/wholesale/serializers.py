from rest_framework import serializers
from .models import RetailerProfile

class RetailerProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = RetailerProfile
        fields = ('id', 'user', 'user_email', 'business_name', 'business_address', 'tax_id', 'is_approved', 'approved_at', 'created_at')
        read_only_fields = ('user', 'is_approved', 'approved_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
