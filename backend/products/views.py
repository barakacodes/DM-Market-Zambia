from rest_framework import generics, permissions, filters, status, parsers
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category, Review, Wishlist, Cart, CartItem
from .serializers import (
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    CategorySerializer, ReviewSerializer, WishlistSerializer, CartSerializer, CartItemSerializer
)
from .permissions import IsSellerOrReadOnly, IsOwnerOrReadOnly

class CategoryListView(generics.ListAPIView):
    pagination_class = None
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category', 'seller').prefetch_related('images')
    serializer_class = ProductListSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'condition', 'seller']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).prefetch_related('images', 'videos', 'reviews')
    serializer_class = ProductDetailSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = 'slug'


class SellerProductListView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated, IsSellerOrReadOnly)
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class SellerProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated, IsSellerOrReadOnly, IsOwnerOrReadOnly)
    lookup_field = 'slug'
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        product_slug = self.kwargs['slug']
        return Review.objects.filter(product__slug=product_slug)


class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WishlistDeleteView(generics.DestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        product_id = kwargs.get('product_id')
        wishlist_item = Wishlist.objects.filter(user=request.user, product_id=product_id).first()
        if wishlist_item:
            wishlist_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartItemAddView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)


class CartItemUpdateDeleteView(generics.UpdateAPIView, generics.DestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        cart = Cart.objects.filter(user=self.request.user).first()
        if cart:
            return cart.items.all()
        return CartItem.objects.none()

    def get_object(self):
        cart = Cart.objects.get(user=self.request.user)
        return cart.items.get(pk=self.kwargs['pk'])
