import axios from 'axios';
import { API_BASE_URL } from '.';

export interface SpecialDays {
  id?: string;
  date: string; // format YYYY-MM-DD
  description: string;
  number_of_masses?: number;
  is_recurrent?: boolean;
}

const API_URL = `${API_BASE_URL}/api/data`;

export const specialDayService = {
    // Récupérer tous les jours spéciaux
   getSpecialDays: async (filters?: Record<string, any>): Promise<SpecialDays[]> => {
    try {
      // Construire la query string à partir de filters, s'il y en a
      const queryString = filters 
        ? '?' + new URLSearchParams(
            Object.entries(filters).map(([key, value]) => [key, String(value)])
          ).toString()
        : '';

      const response = await axios.get(`${API_URL}/special-days${queryString}`);
      const data = response.data;
      return data.map((specialDay: any) => ({
        ...specialDay,
        date: new Date(specialDay.date).toISOString().split('T')[0], // format YYYY-MM-DD
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des jours spéciaux:', error);
      throw new Error('Erreur lors de la récupération des jours spéciaux');
    }
  },
    // Créer un jour spécial
    createSpecialDays: async (specialDay: SpecialDays): Promise<string> => {
      try {
        const response = await axios.post(`${API_URL}/special-days`, specialDay);
        return response.data;
      } catch (error: any) {
        if (error.response.status === 400) throw new Error("Un jour spécial avec cette date existe déjà")
        console.error('Erreur lors de la création du jour spécial:', error);
        throw new Error('Erreur lors de la création du jour spécial');
      }
    },
  
    // Mettre à jour un jour spécial
    updateSpecialDay: async (id: string, specialDay: SpecialDays): Promise<string> => {
      try {
        const response = await axios.put(`${API_URL}/special-days/${id}`, specialDay);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour du jour spécial:', error);
        throw new Error('Erreur lors de la mise à jour du jour spécial');
      }
    },
  
    // Supprimer un jour spécial
    deleteSpecialDay: async (id: string): Promise<string> => {
      try {
        const response = await axios.delete(`${API_URL}/special-days/${id}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la suppression du jour spécial:', error);
        throw new Error('Erreur lors de la suppression du jour spécial');
      }
    },
  };
