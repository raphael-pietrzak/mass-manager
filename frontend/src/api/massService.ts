import axios from 'axios';
import { Mass } from '../features/calendar/types';
import { formatDate } from '../utils/dateUtils';

const API_URL = 'http://localhost:3001/api/data';

export const massService = {
  getMasses: async (): Promise<Mass[]> => {
    const response = await axios.get(`${API_URL}/masses`);
    const data = response.data;
    return data.map((mass: any) => ({
      ...mass,
      date: formatDate(mass.date) // Convertir le timestamp en format YYYY-MM-DD
    }));
  },

  getMass: async (id: string) => {
    const response = await axios.get(`${API_URL}/masses/${id}`);
    return response.data;
  },

  createMass: async (mass: any) => {
    const response = await axios.post(`${API_URL}/masses`, mass);
    return response.data;
  },

  updateMass: async (id: string, mass: any) => {
    const response = await axios.put(`${API_URL}/masses/${id}`, mass);
    return response.data;
  },

  deleteMass: async (id: string) => {
    await axios.delete(`${API_URL}/masses/${id}`);
  }
};
