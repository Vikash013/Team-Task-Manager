import api from '../api/axios.js';

export const getTasksRequest = () => api.get('/tasks');

export const createTaskRequest = (task) => api.post('/tasks', task);

export const updateTaskRequest = (taskId, task) => api.put(`/tasks/${taskId}`, task);

export const deleteTaskRequest = (taskId) => api.delete(`/tasks/${taskId}`);

export const updateTaskStatusRequest = (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status });

export const addTaskCommentRequest = (taskId, body) => api.post(`/tasks/${taskId}/comments`, { body });
