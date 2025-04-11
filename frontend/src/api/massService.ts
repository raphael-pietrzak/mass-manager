import axios from 'axios';
import { formatDate, extractTimeOnly } from '../utils/dateUtils';
import { API_BASE_URL } from '.';

export interface Mass {
  id?: string;
  date: string; // format YYYY-MM-DD
  time: string; // format HH:MM
  intention?: string;
  celebrant: string;
  location: string;
  status?: 'scheduled' | 'cancelled' | 'pending';
}

const API_URL = `${API_BASE_URL}/api/data`;

export const massService = {
  getMasses: async (): Promise<Mass[]> => {
    const response = await axios.get(`${API_URL}/masses`);
    const data = response.data;
    console.log("Date formated:", data.map((mass: any) => ({
        date: formatDate(mass.date),
        time: extractTimeOnly(mass.date)
    })));
    return data.map((mass: any) => ({
      ...mass,
      date: formatDate(mass.date), // Convertir le timestamp en format YYYY-MM-DD
      time: extractTimeOnly(mass.date) // Extrait juste l'heure au format HH:MM
    }));
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
