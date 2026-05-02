import api from '../api/axios.js';

export const getDashboardRequest = () => api.get('/dashboard');
