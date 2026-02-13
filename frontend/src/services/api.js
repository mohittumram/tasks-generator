import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateTasks = async (data) => {
  const response = await api.post('/api/generate', data);
  return response.data;
};

export const getSpecs = async () => {
  const response = await api.get('/api/specs');
  return response.data;
};

export const getSpec = async (specId) => {
  const response = await api.get(`/api/specs/${specId}`);
  return response.data;
};

export const updateTasks = async (specId, data) => {
  const response = await api.put(`/api/specs/${specId}/tasks`, data);
  return response.data;
};

export const exportSpec = async (specId) => {
  const response = await api.get(`/api/specs/${specId}/export`);
  return response.data;
};

export const getHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
