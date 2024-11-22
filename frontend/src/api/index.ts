import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Components
export const getComponents = () => api.get('/components');
export const createComponent = (component: any) => api.post('/components', component);
export const updateComponent = (id: string, component: any) => api.patch(`/components/${id}`, component);
export const deleteComponent = (id: string) => api.delete(`/components/${id}`);
