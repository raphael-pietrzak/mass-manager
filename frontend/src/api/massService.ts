import axios from 'axios';
import { API_BASE_URL } from '.';

export interface Mass {
  id?: string;
  date: string; // format YYYY-MM-DD
  type: 'defunts' | 'vivants';
  intention?: string;
  celebrant_id: string; // ID du célébrant, plus de champ "celebrant"
  celebrant_title?: string; // Titre du célébrant pour l'affichage
  celebrant_name?: string; // Nom du célébrant pour l'affichage
  status?: 'scheduled' | 'cancelled' | 'pending';
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
  paymentMethod?: 'cheque' | 'cash' | 'card' | 'transfer';
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

// Type pour la réponse de prévisualisation avec une structure simplifiée des masses
export interface MassPreview {
  masses: {
    date: string | null; // peut être null pour les messes sans date assignée
    intention: string;
    type: 'defunts' | 'vivants';
    celebrant_id: string | null; // peut être null si non assigné
    celebrant_name: string;
    status: 'scheduled' | 'cancelled' | 'pending';
  }[];
  totalAmount: string;
  massCount: number;
}

// Nouveau type pour la soumission finale basée sur la prévisualisation
export interface MassSubmission {
  id?: string;
  preview: MassPreview;
  donor: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    wantsCelebrationDate: boolean;
  };
  payment: {
    amount: string;
    paymentMethod: 'cheque' | 'cash' | 'card' | 'transfer';
    brotherName?: string;
  };
}

const API_URL = `${API_BASE_URL}/api/data/masses`;

export const massService = {
  getMasses: async (): Promise<Mass[]> => {
    const response = await axios.get(`${API_URL}`);
    const data = response.data;
    return data.map((mass: any) => ({
      ...mass,
      date: mass.date ? new Date(mass.date).toISOString().split('T')[0] : null,
    }));
  },
  // createMass: async (mass: MassSubmission): Promise<string> => {
  //   const response = await axios.post(`${API_URL}`, mass);
  //   return response.data;
  // },

  updateMass: async (id: string, mass: any) => {
    const response = await axios.put(`${API_URL}/${id}`, mass);
    return response.data;
  },

  deleteMass: async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
  },
};
