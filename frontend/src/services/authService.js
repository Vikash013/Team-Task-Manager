import api from '../api/axios.js';

export const loginRequest = (credentials) => api.post('/auth/login', credentials);

export const signupRequest = (values) => api.post('/auth/signup', values);

export const getCurrentUserRequest = () => api.get('/auth/me');

export const forgotPasswordRequest = (email) => api.post('/auth/forgot-password', { email });

export const resetPasswordRequest = (token, password) => api.post('/auth/reset-password', { token, password });
