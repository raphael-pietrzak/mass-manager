export interface Mass {
    id: string;
    date: string;
    time: string;
    type: 'chantée' | 'basse';
    intention?: string;
    celebrant: string;
    location: string;
  }
  
  export type ViewMode = 'calendar' | 'list';