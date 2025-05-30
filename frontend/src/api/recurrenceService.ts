import apiClient from './apiClient';

export interface Recurrence {
  id?: number;
  type: 'daily' | 'weekly' | 'monthly' | 'relative_position' | 'yearly';
  start_date: string;
  end_type: 'occurrences' | 'date';
  occurrences?: number;
  end_date?: string;
  position?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  weekday?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  created_at?: string;
  updated_at?: string;
}

export const recurrenceService = {
  getAll: (): Promise<Recurrence[]> => 
    apiClient.get('/data/recurrences').then(response => response.data),

  getById: (id: number): Promise<Recurrence> => 
    apiClient.get(`/data/recurrences/${id}`).then(response => response.data),

  create: (recurrence: Omit<Recurrence, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: number }> => 
    apiClient.post('/data/recurrences', recurrence).then(response => response.data),

  update: (id: number, recurrence: Partial<Recurrence>): Promise<void> => 
    apiClient.put(`/data/recurrences/${id}`, recurrence).then(response => response.data),

  delete: (id: number): Promise<void> => 
    apiClient.delete(`/data/recurrences/${id}`).then(response => response.data),

  getActive: (): Promise<Recurrence[]> => 
    apiClient.get('/data/recurrences/active').then(response => response.data),

  getByType: (type: string): Promise<Recurrence[]> => 
    apiClient.get(`/data/recurrences/type/${type}`).then(response => response.data),
};
