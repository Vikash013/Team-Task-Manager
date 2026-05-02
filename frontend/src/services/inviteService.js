import api from '../api/axios.js';

export const getInvitesRequest = () => api.get('/invites');

export const createInviteRequest = (invite) => api.post('/invites', invite);

export const verifyInviteRequest = (token) => api.get(`/invites/verify/${token}`);

export const cancelInviteRequest = (inviteId) => api.patch(`/invites/${inviteId}/cancel`);

export const deleteInviteRequest = (inviteId) => api.delete(`/invites/${inviteId}`);

export const clearInviteHistoryRequest = () => api.delete('/invites/history/inactive');
