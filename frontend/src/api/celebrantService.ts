import axios from 'axios';
import { API_BASE_URL } from '.';

export interface Celebrant {
  id: string;
  civil_firstname: string;
  civil_lastname: string;
  religious_name?: string;
  title: string;
  role: string;
}

const API_URL = `${API_BASE_URL}/api/data`;

class CelebrantService {
  async getCelebrants(): Promise<Celebrant[]> {
    try {
      const response = await axios.get(`${API_URL}/celebrants`);
      
      // Vérifier si les données sont un tableau
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si c'est un objet qui contient un tableau (par exemple { celebrants: [...] })
        // Essayons de trouver une propriété qui pourrait contenir notre tableau
        const possibleArrays = Object.values(response.data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          return possibleArrays[0] as Celebrant[];
        }
      }
      
      // Si on ne trouve pas de tableau, on renvoie un tableau vide
      console.error('Format de données inattendu:', response.data);
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des célébrants:', error);
      return [];
    }
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

  async addCelebrant(celebrant: Celebrant): Promise<string> {
    const response = await axios.post(`${API_URL}/celebrants`, celebrant);
    return response.data;
  }

  async deleteCelebrant(id: string): Promise<string> {
    const response = await axios.delete(`${API_URL}/celebrants/${id}`);
    return response.data;
  }

  async updateCelebrant(celebrant: Celebrant): Promise<string> {
    const response = await axios.put(`${API_URL}/celebrants/${celebrant.id}`, celebrant); 
    return response.data;
  }

  async getCelebrantById(id: string): Promise<Celebrant | null> {
    try {
      const response = await axios.get(`${API_URL}/celebrants/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du célébrant:", error);
      return null;
    }
  }

  async getUnavailableDates(celebrantId: string): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/celebrants/${celebrantId}/unavailable-dates`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des dates indisponibles:', error);
      return [];
    }
  }
}

export const celebrantService = new CelebrantService();
