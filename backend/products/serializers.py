from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVideo, Review, Wishlist, Cart, CartItem

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'image', 'parent', 'children')
    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True).data

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary')
        read_only_fields = ('id',)

class ProductVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVideo
        fields = ('id', 'video_url', 'thumbnail')

class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    avg_rating = serializers.FloatField(read_only=True, required=False)
    review_count = serializers.IntegerField(read_only=True, required=False)
    wholesale_price = serializers.SerializerMethodField()
    moq = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'title', 'slug', 'price', 'wholesale_price', 'moq', 'stock', 'condition', 'primary_image', 'created_at', 'seller', 'avg_rating', 'review_count')

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None

    def _can_see_wholesale(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if obj.seller == request.user:
            return True
        # Avoid circular imports by importing here
        from wholesale.models import RetailerProfile
        return RetailerProfile.objects.filter(user=request.user, is_approved=True).exists()

    def get_wholesale_price(self, obj):
        if self._can_see_wholesale(obj) and obj.wholesale_price:
            return obj.wholesale_price
        return None

    def get_moq(self, obj):
        if self._can_see_wholesale(obj) and obj.moq > 1:
            return obj.moq
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    videos = ProductVideoSerializer(many=True, read_only=True)
    seller_name = serializers.CharField(source='seller.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    avg_rating = serializers.FloatField(read_only=True, required=False)
    review_count = serializers.IntegerField(read_only=True, required=False)
    wholesale_price = serializers.SerializerMethodField()
    moq = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def _can_see_wholesale(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if obj.seller == request.user:
            return True
        from wholesale.models import RetailerProfile
        return RetailerProfile.objects.filter(user=request.user, is_approved=True).exists()

    def get_wholesale_price(self, obj):
        if self._can_see_wholesale(obj) and obj.wholesale_price:
            return obj.wholesale_price
        return None

    def get_moq(self, obj):
        if self._can_see_wholesale(obj) and obj.moq > 1:
            return obj.moq
        return None

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, required=False)
    class Meta:
        model = Product
        fields = ('category', 'title', 'description', 'price', 'wholesale_price', 'moq', 'stock', 'condition', 'is_active', 'images')
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        validated_data['seller'] = self.context['request'].user
        product = super().create(validated_data)
        has_primary = any(d.get('is_primary') for d in images_data)
        for idx, img_data in enumerate(images_data):
            is_primary = img_data.get('is_primary', False) or (idx == 0 and not has_primary)
            ProductImage.objects.create(product=product, **img_data, is_primary=is_primary)
        return product
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        product = super().update(instance, validated_data)
        if images_data is not None:
            has_primary = any(d.get('is_primary') for d in images_data) or instance.images.filter(is_primary=True).exists()
            for idx, img_data in enumerate(images_data):
                is_primary = img_data.get('is_primary', False) or (idx == 0 and not has_primary)
                ProductImage.objects.create(product=product, **img_data, is_primary=is_primary)
        return product

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    class Meta:
        model = Review
        fields = ('id', 'product', 'user', 'user_email', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'added_at')
        read_only_fields = ('user',)
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'price')

    def create(self, validated_data):
        cart, _ = Cart.objects.get_or_create(user=self.context['request'].user)
        validated_data['cart'] = cart
        # Set price based on wholesale if applicable
        from wholesale.models import RetailerProfile
        product = validated_data['product_id']
        # Fetch product instance to get price
        try:
            product_obj = Product.objects.get(pk=product)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        # Determine price: if user is retailer and product has wholesale_price and quantity meets MOQ
        user = self.context['request'].user
        retailer = RetailerProfile.objects.filter(user=user, is_approved=True).first()
        effective_price = product_obj.price
        if retailer and product_obj.wholesale_price and validated_data.get('quantity', 1) >= product_obj.moq:
            effective_price = product_obj.wholesale_price
        validated_data['price'] = effective_price
        return super().create(validated_data)

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    class Meta:
        model = Cart
        fields = ('id', 'items', 'created_at')
