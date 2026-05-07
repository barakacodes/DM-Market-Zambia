import api from './axios';

export const registerUser = (data) => api.post('/auth/register/', data);
export const loginUser = (data) => api.post('/auth/login/', data);
export const fetchUser = () => api.get('/auth/me/');
export const refreshToken = (refresh) => api.post('/auth/token/refresh/', { refresh });
