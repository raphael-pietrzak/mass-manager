import axios from 'axios';
import { API_BASE_URL } from '.';

export interface Celebrant {
  id: string;
  civil_first_name: string;
  civil_last_name: string;
  religious_name?: string;
  title: string;
  role: string;
}

const API_URL = `${API_BASE_URL}/api/data`;

class CelebrantService {
  async getCelebrants(): Promise<Celebrant[]> {
    const response = await axios.get(`${API_URL}/celebrants`);
    return response.data;
  }

  async getAvailableCelebrants(date?: string): Promise<Celebrant[]> {
    try {
      const response = await fetch(`${API_URL}/celebrants/available?date=${date}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des célébrants');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans le service célébrant:', error);
      return [];
    }
  }
}

export const celebrantService = new CelebrantService();
