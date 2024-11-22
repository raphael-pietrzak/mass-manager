export interface Component {
    id: string;
    name: string;
    xpath: string;
    description: string;
    tags: string[];
    createdBy: string;
    createdAt: Date;
}


export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
}