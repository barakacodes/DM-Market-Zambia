import api from './axios';

export const getRetailerStatus = () => api.get('/wholesale/status/');
export const applyRetailer = (data) => api.post('/wholesale/apply/', data);
