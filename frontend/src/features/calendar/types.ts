export interface Mass {
  _id: string;
  date: string; // format YYYY-MM-DD
  time: string; // format HH:MM
  type: 'basse' | 'chantée';
  intention?: string;
  celebrant: string;
  location: string;
  status?: 'scheduled' | 'cancelled';
}

export type ViewMode = 'calendar' | 'list';