
export interface Donor {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    wants_notification: boolean;
}

export interface Celebrant {
    id: string;
    name: string;
    email: string;
    is_available: boolean;
}

export interface Intention {
    id: string;
    description: string;
    amount: number;
    donor_id: string;
    date_requested: string;
}

export interface Mass {
    id: string;
    date: string;
    celebrant_id: string;
    intention_id: string;
    status: string;
}

export interface SpecialDay {
    id: string;
    date: string;
    note: string;
    number_of_masses: number;
}
