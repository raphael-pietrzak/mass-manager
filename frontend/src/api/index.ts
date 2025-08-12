import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/data`,
});

// Donors
export const getDonors = () => api.get('/donors');
export const createDonor = (donor: any) => api.post('/donors', donor);
export const updateDonor = (id: string, donor: any) => api.patch(`/donors/${id}`, donor);
export const deleteDonor = (id: string) => api.delete(`/donors/${id}`);

// Celebrants
export const getCelebrants = () => api.get('/celebrants');
export const createCelebrant = (celebrant: any) => api.post('/celebrants', celebrant);
export const updateCelebrant = (id: string, celebrant: any) => api.patch(`/celebrants/${id}`, celebrant);
export const deleteCelebrant = (id: string) => api.delete(`/celebrants/${id}`);

// Intentions
export const getIntentions = () => api.get('/intentions');
export const createIntention = (intention: any) => api.post('/intentions', intention);
export const updateIntention = (id: string, intention: any) => api.put(`/intentions/${id}`, intention);
export const deleteIntention = (id: string) => api.delete(`/intentions/${id}`);

// Masses
export const getMasses = () => api.get('/masses');
export const createMass = (mass: any) => api.post('/masses', mass);
export const updateMass = (id: string, mass: any) => api.patch(`/masses/${id}`, mass);
export const deleteMass = (id: string) => api.delete(`/masses/${id}`);

// Special Days
export const getSpecialDays = () => api.get('/special-days');
export const createSpecialDay = (specialDay: any) => api.post('/special-days', specialDay);
export const updateSpecialDay = (id: string, specialDay: any) => api.patch(`/special-days/${id}`, specialDay);
export const deleteSpecialDay = (id: string) => api.delete(`/special-days/${id}`);

