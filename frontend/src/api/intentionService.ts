import axios from 'axios';
import { API_BASE_URL } from '.';

export interface Intention {
    id?: string;
    date?: string; // format YYYY-MM-DD
    intention?: string;
    celebrant_id?: string; // Maintenant optionnel
    celebrant_name?: string;
    status?: 'scheduled' | 'cancelled' | 'pending';
    isForDeceased?: boolean;

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
    startDate?: string; // format YYYY-MM-DD (modifié)
    endDate?: string;   // format YYYY-MM-DD (modifié)
    endType?: 'occurrences' | 'date';
}

export interface Masses {
    date: string | null; // peut être null pour les messes sans date assignée
    intention: string;
    type: 'defunts' | 'vivants';
    celebrant_id: string | null; // peut être null si non assigné
    celebrant_name: string;
    status: 'scheduled' | 'cancelled' | 'pending';
}

export interface IntentionSubmission {
  id?: string;
  masses: Masses[];
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

export interface IntentionWithMasses extends Intention {
    masses?: Masses[];
}

const API_URL = `${API_BASE_URL}/api/data/intentions`;

export const intentionService = {
    async previewMasses(data: Partial<Intention>) {
        const response = await axios.post(`${API_URL}/preview`, data);
        return response.data; // Retourne les données de prévisualisation
    },

    async createMass(data: IntentionSubmission) {
        const response = await axios.post(`${API_URL}`, data);
        return response.data; // Retourne les données de création
    },

    async updateMass(id: string, data: Partial<Intention>) {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data; // Retourne les données mises à jour
    },

    async getIntentions(): Promise<IntentionWithMasses[]> {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    },

    async getIntentionById(id: string): Promise<IntentionWithMasses> {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    async getIntentionMasses(id: string): Promise<Masses[]> {
        const response = await axios.get(`${API_URL}/${id}/masses`);
        return response.data;
    },

    async deleteMass(id: string) {
        await axios.delete(`${API_URL}/${id}`);
    }
};