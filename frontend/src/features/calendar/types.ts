export interface Mass {
  id?: string;
  date: string; // format YYYY-MM-DD
  time: string; // format HH:MM
  //type: 'basse' | 'chantée';
  intention?: string;
  celebrant: string;
  //location: string;
  status?: 'scheduled' | 'cancelled';
}

export interface Donor {
  id: string;
  lastname: string;
  firstname: string;
  email: string;
  phone: string;
  address: string;
  wants_notification: boolean;
}

export type ViewMode = 'calendar' | 'list';