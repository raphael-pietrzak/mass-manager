import axios from 'axios';
import { API_BASE_URL } from '.';

export interface Donor {
    id: number;
    firstname: string;
    lastname: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    zip_code?: string;
}

const API_URL = `${API_BASE_URL}/api/data`;

class DonorService {
    async getDonors(): Promise<Donor[]> {
      const response = await axios.get(`${API_URL}/donors`);
      return response.data;
    }
}
  
export const donorsService = new DonorService();
  