export interface Canon {
    id: string;
    name: string;
  }
  
  export interface MassIntention {
    id: string;
    canonId: string;
    date: string;
    intention: string;
    requestedBy: string;
    mass?: {
      celebrantId: string;
      status: 'scheduled' | 'completed' | 'cancelled';
      time?: string;
    };
  }