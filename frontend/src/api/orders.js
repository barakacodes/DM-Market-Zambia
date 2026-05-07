import api from './axios';

export const createOrder = (data) => api.post('/orders/create/', data);
export const getOrders = () => api.get('/orders/');
export const getOrder = (id) => api.get(`/orders/${id}/`);
