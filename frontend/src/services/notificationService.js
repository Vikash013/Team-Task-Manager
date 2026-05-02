import api from '../api/axios.js';

export const getOverdueNotificationsRequest = () => api.get('/notifications/overdue');
