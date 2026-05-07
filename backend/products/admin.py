from django.contrib import admin
from .models import Category, Product, ProductImage, ProductVideo, Review, Wishlist, Cart, CartItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'price', 'stock', 'is_active')
    search_fields = ('title', 'seller__email')
    prepopulated_fields = {'slug': ('title',)}

admin.site.register(ProductImage)
admin.site.register(ProductVideo)
admin.site.register(Review)
admin.site.register(Wishlist)
admin.site.register(Cart)
admin.site.register(CartItem)
