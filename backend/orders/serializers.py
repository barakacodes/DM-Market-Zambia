from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Cart

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product_title', 'price', 'quantity', 'image')


class OrderListSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'status', 'total_price', 'created_at', 'items')


class OrderCreateSerializer(serializers.Serializer):
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.filter(user=user).first()
        if not cart or not cart.items.exists():
            raise serializers.ValidationError("Your cart is empty.")

        # Calculate total and prepare items
        total = 0
        order_items = []
        for item in cart.items.all():
            product = item.product
            if item.quantity > product.stock:
                raise serializers.ValidationError(f"Insufficient stock for {product.title}.")
            price = product.price  # could be wholesale_price for wholesalers, but keep simple
            total += price * item.quantity
            order_items.append({
                'product': product,
                'product_title': product.title,
                'price': price,
                'quantity': item.quantity,
                'image': product.images.filter(is_primary=True).first().image.url if product.images.filter(is_primary=True).exists() else ''
            })

        # Create order
        order = Order.objects.create(
            buyer=user,
            total_price=total,
            shipping_address=validated_data.get('shipping_address', ''),
            phone=validated_data.get('phone', '')
        )
        for oi in order_items:
            OrderItem.objects.create(order=order, **oi)
            # decrease stock
            oi['product'].stock -= oi['quantity']
            oi['product'].save()

        # Clear cart
        cart.items.all().delete()
        return order
