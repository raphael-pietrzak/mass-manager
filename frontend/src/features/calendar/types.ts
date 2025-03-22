export interface Mass {
    id: string;
    date: string;
    time: string;
    type: 'basse' | 'chantée';
    intention?: string;
    celebrant: string;
    location: string;
    status?: 'scheduled' | 'cancelled';
}

export type ViewMode = 'calendar' | 'list';