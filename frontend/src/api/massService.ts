import axios from 'axios';
import { formatDate } from '../utils/dateUtils';
import { API_BASE_URL } from '.';

export interface Mass {
  id?: string;
  date: string; // format YYYY-MM-DD
  type: 'defunts' | 'vivants';
  intention?: string;
  celebrant: string;
  status?: 'scheduled' | 'cancelled';
  // Données du donateur
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  wantsCelebrationDate?: boolean;
  // Données de l'offrande
  amount?: string;
  paymentMethod?: string;
  brotherName?: string;
  // Données de masse
  massCount?: number;
  massType?: string;
  dateType?: string;
  // Données de récurrence
  isRecurrent?: boolean;
  recurrenceType?: string;
  occurrences?: number;
  startDate?: string;
  endDate?: string;
  endType?: string;
}

const API_URL = `${API_BASE_URL}/api/data`;

export const massService = {
  getMasses: async (): Promise<Mass[]> => {
    const response = await axios.get(`${API_URL}/masses`);
    const data = response.data;
    console.log("Date formated:", data.map((mass: any) => ({
        date: formatDate(mass.date)
    })));
    return data.map((mass: any) => ({
      ...mass,
      date: formatDate(mass.date) // Convertir le timestamp en format YYYY-MM-DD
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
