import { create } from 'zustand';
import { User, Component } from '../types/index';
import * as api from '../api';

interface Store {
    currentUser: User | null;
    users: User[];
    components: Component[];


    // Components
    fetchComponents: () => Promise<void>;
    addComponent: (component: Omit<Component, 'id'>) => Promise<void>;
    updateComponent: (id: string, component: Partial<Component>) => Promise<void>;
    deleteComponent: (id: string) => Promise<void>;

}

const useStore = create<Store>((set, get) => ({
    currentUser: null,
    users: [],
    components: [],


    // Components
    fetchComponents: async () => {
        const components = await api.getComponents();
        set({ components });
    },
    addComponent: async (component) => {
        await api.createComponent(component);
        await get().fetchComponents();
    },
    updateComponent: async (id, component) => {
        await api.updateComponent(id, component);
        await get().fetchComponents();
    },
    deleteComponent: async (id) => {
        await api.deleteComponent(id);
        await get().fetchComponents();
    },

}));

export default useStore;    