import api from './axios';

export const getProducts = (params) => api.get('/products/', { params });
export const getProduct = (slug) => api.get(`/products/${slug}/`);
export const getCategories = () => api.get('/products/categories/');
export const addToCart = (productId, quantity) => api.post('/products/cart/add/', { product_id: productId, quantity });
export const getCart = () => api.get('/products/cart/');
export const updateCartItem = (itemId, quantity) => api.patch(`/products/cart/${itemId}/`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/products/cart/${itemId}/`);
export const addToWishlist = (productId) => api.post('/products/wishlist/', { product: productId });
export const removeFromWishlist = (productId) => api.delete(`/products/wishlist/${productId}/`);
