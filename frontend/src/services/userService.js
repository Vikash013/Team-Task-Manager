import api from '../api/axios.js';

export const getMembersRequest = () => api.get('/users/members');

export const getUsersRequest = () => api.get('/users');

export const removeUserRequest = (userId, removalPassword) =>
  api.delete(`/users/${userId}`, { data: { removalPassword } });
