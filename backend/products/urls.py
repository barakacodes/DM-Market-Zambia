from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('reviews/create/', views.ReviewCreateView.as_view(), name='review-create'),
    path('seller/', views.SellerProductListView.as_view(), name='seller-product-list'),
    path('seller/<slug:slug>/', views.SellerProductDetailView.as_view(), name='seller-product-detail'),
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', views.WishlistDeleteView.as_view(), name='wishlist-delete'),
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/', views.CartItemAddView.as_view(), name='cart-add'),
    path('cart/<int:pk>/', views.CartItemUpdateDeleteView.as_view(), name='cart-item-update-delete'),
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<slug:slug>/reviews/', views.ReviewListView.as_view(), name='product-reviews'),
]
