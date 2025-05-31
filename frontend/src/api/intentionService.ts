import axios from 'axios';
import { API_BASE_URL } from '.';

export interface Intention {
    id: string;
    date?: string;
    intention_text?: string;
    celebrant_id?: string;
    celebrant_name?: string;
    status?: 'scheduled' | 'cancelled' | 'pending';
    deceased?: boolean;

    // Données du donateur
    donor_firstname?: string;
    donor_lastname?: string;
    donor_email?: string;
    donor_phone?: string;
    donor_address?: string;
    donor_postal_code?: string;
    donor_city?: string;
    wants_celebration_date?: boolean;
    donor_id?: number;

    // Données de l'offrande
    amount?: string;
    payment_method?: 'cheque' | 'cash' | 'card' | 'transfer';
    brother_name?: string | null;
    
    // Données de masse
    mass_count?: number;
    mass_type?: string;
    date_type?: 'imperative' | 'preferred' | 'indifferent';
    
    // Données de récurrence
    is_recurrent?: boolean;
    recurrence_type?: string | null;
    occurrences?: number | null;
    start_date?: string | null; 
    end_date?: string | null;
    end_type?: string | null;

    // Options de récurrence avancées
    position?: string | null;        // Pour "Position relative" (1er, 2eme, 3eme, 4eme, dernier)
    weekday?: string | null;         // Pour "Position relative" (lundi, mardi, etc.)
    
    // Horodatage
    created_at?: string;
    updated_at?: string;
}

export interface Masses {
    date: string | null; // peut être null pour les messes sans date assignée
    intention: string;
    type: 'defunts' | 'vivants';
    celebrant_title: string;
    celebrant_id: string | null; // peut être null si non assigné
    celebrant_name: string;
    status: 'scheduled' | 'cancelled' | 'pending';
}

export interface IntentionSubmission {
  id?: string;
  masses: Masses[];
  donor: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    address?: string;
    postal_code?: string;
    city?: string;
    wants_celebration_date: boolean;
  };
  payment: {
    amount: string;
    payment_method: 'cheque' | 'cash' | 'card' | 'transfer';
    brother_name?: string;
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

    async getPonctualIntentions(): Promise<Intention[]> {
        const response = await axios.get(`${API_URL}/ponctual`);
        return response.data;
    },

    async deleteMass(id: string) {
        await axios.delete(`${API_URL}/${id}`);
    }
};