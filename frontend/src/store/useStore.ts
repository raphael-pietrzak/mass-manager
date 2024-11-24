import { create } from 'zustand';
import { Donor, Celebrant, Intention, Mass, SpecialDay } from '../types/index';
import * as api from '../api';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return "An unknown error occurred";
}


interface Store {
    donors: Donor[];
    celebrants: Celebrant[];
    intentions: Intention[];
    masses: Mass[];
    specialDays: SpecialDay[];
    isLoading: boolean;
    error: string | null;

    // Donors
    fetchDonors: () => Promise<void>;
    addDonor: (donor: Donor) => Promise<void>;
    updateDonor: (id: string, donor: Donor) => Promise<void>;
    deleteDonor: (id: string) => Promise<void>;

    // Celebrants
    fetchCelebrants: () => Promise<void>;
    addCelebrant: (celebrant: Celebrant) => Promise<void>;
    updateCelebrant: (id: string, celebrant: Celebrant) => Promise<void>;
    deleteCelebrant: (id: string) => Promise<void>;

    // Intentions
    fetchIntentions: () => Promise<void>;
    addIntention: (intention: Intention) => Promise<void>;
    updateIntention: (id: string, intention: Intention) => Promise<void>;
    deleteIntention: (id: string) => Promise<void>;

    // Masses
    fetchMasses: () => Promise<void>;
    addMass: (mass: Mass) => Promise<void>;
    updateMass: (id: string, mass: Mass) => Promise<void>;
    deleteMass: (id: string) => Promise<void>;

    // Special Days
    fetchSpecialDays: () => Promise<void>;
    addSpecialDay: (specialDay: SpecialDay) => Promise<void>;
    updateSpecialDay: (id: string, specialDay: SpecialDay) => Promise<void>;
    deleteSpecialDay: (id: string) => Promise<void>;


}

const useStore = create<Store>((set, get) => ({

    donors: [],
    celebrants: [],
    intentions: [],
    masses: [],
    specialDays: [],
    isLoading: false,
    error: null,

    // Donors
    fetchDonors: async () => {
        set({ isLoading: true });
        try {
            const response = await api.getDonors();
            set({ donors: response.data });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    addDonor: async (donor) => {
        set({ isLoading: true });
        try {
            const response = await api.createDonor(donor);
            set({ donors: [...get().donors, response.data] });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    updateDonor: async (id, donor) => {
        set({ isLoading: true });
        try {
            const response = await api.updateDonor(id, donor);
            const updatedDonors = get().donors.map((donor) => {
                if (donor.id === id) {
                    return response.data;
                }
                return donor;
            });
            set({ donors: updatedDonors });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    deleteDonor: async (id) => {
        set({ isLoading: true });
        try {
            await api.deleteDonor(id);
            const updatedDonors = get().donors.filter((donor) => donor.id !== id);
            set({ donors: updatedDonors });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },

    // Celebrants
    fetchCelebrants: async () => {
        set({ isLoading: true });
        try {
            const response = await api.getCelebrants();
            set({ celebrants: response.data });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    addCelebrant: async (celebrant) => {
        set({ isLoading: true });
        try {
            const response = await api.createCelebrant(celebrant);
            set({ celebrants: [...get().celebrants, response.data] });
        } catch (
            error
        ) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },

    updateCelebrant: async (id, celebrant) => {
        set({ isLoading: true });
        try {
            const response = await api.updateCelebrant(id, celebrant);
            const updatedCelebrants = get().celebrants.map((celebrant) => {
                if (celebrant.id === id) {
                    return response.data;
                }
                return celebrant;
            });
            set({ celebrants: updatedCelebrants });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    deleteCelebrant: async (id) => {
        set({ isLoading: true });
        try {
            await api.deleteCelebrant(id);
            const updatedCelebrants = get().celebrants.filter((celebrant) => celebrant.id !== id);
            set({ celebrants: updatedCelebrants });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },

    // Intentions
    fetchIntentions: async () => {
        set({ isLoading: true });
        try {
            const response = await api.getIntentions();
            set({ intentions: response.data });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    addIntention: async (intention) => {
        set({ isLoading: true });
        try {
            const response = await api.createIntention(intention);
            set({ intentions: [...get().intentions, response.data] });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    updateIntention: async (id, intention) => {
        set({ isLoading: true });
        try {
            const response = await api.updateIntention(id, intention);
            const updatedIntentions = get().intentions.map((intention) => {
                if (intention.id === id) {
                    return response.data;
                }
                return intention;
            });
            set({ intentions: updatedIntentions });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    deleteIntention: async (id) => {
        set({ isLoading: true });
        try {
            await api.deleteIntention(id);
            const updatedIntentions = get().intentions.filter((intention) => intention.id !== id);
            set({ intentions: updatedIntentions });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },

    // Masses
    fetchMasses: async () => {
        set({ isLoading: true });
        try {
            const response = await api.getMasses();
            set({ masses: response.data });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },

    addMass: async (mass) => {
        set({ isLoading: true });
        try {
            const response = await api.createMass(mass);
            set({ masses: [...get().masses, response.data] });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },

    updateMass: async (id, mass) => {
        set({ isLoading: true });
        try {
            const response = await api.updateMass(id, mass);
            const updatedMasses = get().masses.map((mass) => {
                if (mass.id === id) {
                    return response.data;
                }
                return mass;
            });
            set({ masses: updatedMasses });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    deleteMass: async (id) => {
        set({ isLoading: true });
        try {
            await api.deleteMass(id);
            const updatedMasses = get().masses.filter((mass) => mass.id !== id);
            set({ masses: updatedMasses });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },

    // Special Days
    fetchSpecialDays: async () => {
        set({ isLoading: true });
        try {
            const response = await api.getSpecialDays();
            set({ specialDays: response.data });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    addSpecialDay: async (specialDay) => {
        set({ isLoading: true });
        try {
            const response = await api.createSpecialDay(specialDay);
            set({ specialDays: [...get().specialDays, response.data] });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    updateSpecialDay: async (id, specialDay) => {
        set({ isLoading: true });
        try {
            const response = await api.updateSpecialDay(id, specialDay);
            const updatedSpecialDays = get().specialDays.map((specialDay) => {
                if (specialDay.id === id) {
                    return response.data;
                }
                return specialDay;
            });
            set({ specialDays: updatedSpecialDays });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
    deleteSpecialDay: async (id) => {
        set({ isLoading: true });
        try {
            await api.deleteSpecialDay(id);
            const updatedSpecialDays = get().specialDays.filter((specialDay) => specialDay.id !== id);
            set({ specialDays: updatedSpecialDays });
        } catch (error) {
            set({ error: getErrorMessage(error) });
        }
        set({ isLoading: false });
    },
}));



export default useStore;