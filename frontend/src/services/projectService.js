import api from '../api/axios.js';

export const getProjectsRequest = () => api.get('/projects');

export const createProjectRequest = (project) => api.post('/projects', project);

export const updateProjectRequest = (projectId, project) => api.put(`/projects/${projectId}`, project);

export const deleteProjectRequest = (projectId) => api.delete(`/projects/${projectId}`);
