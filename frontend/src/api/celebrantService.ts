import axios from 'axios';

export interface Celebrant {
  id: string;
  religious_name: string;
  civil_first_name: string;
  civil_last_name: string;
  title: string;
  role: string;
}

const API_URL = `${import.meta.env.VITE_API_URL}/api/data`;

export const celebrantService = {
  getCelebrants: async (): Promise<Celebrant[]> => {
    const response = await axios.get(`${API_URL}/celebrants`);
    return response.data;
  }
};
