import axios from 'axios';
import { MassIntention } from './types';

const API_URL = 'http://localhost:3001/api/data';

export const IntentionsService = {
  async getAll(): Promise<MassIntention[]> {
    const response = await axios.get(`${API_URL}/intentions`);
    return response.data;
  },

  async create(intention: Partial<MassIntention>): Promise<MassIntention> {
    const response = await axios.post(`${API_URL}/intentions`, intention);
    return response.data;
  },

  async update(id: string, intention: Partial<MassIntention>): Promise<MassIntention> {
    const response = await axios.put(`${API_URL}/intentions/${id}`, intention);
    return response.data;
  }
};

export const MassesService = {
  async getAll(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/masses`);
    return response.data;
  },

  async create(mass: any): Promise<any> {
    const response = await axios.post(`${API_URL}/masses`, mass);
    return response.data;
  }
};
