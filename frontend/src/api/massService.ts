import axios from "axios"
import { API_BASE_URL } from "."

// mass status
export type MassStatus = 'pending' | 'scheduled' | 'cancelled' | 'completed'

export interface Mass {
	id?: string
	date: string // format YYYY-MM-DD
	deceased: number
	intention?: string
	celebrant_id: string
	celebrant_religious_name: string // ID du célébrant, plus de champ "celebrant"
	celebrant_title?: string // Titre du célébrant pour l'affichage
	status?: MassStatus // Statut de la messe
	// Données du donateur
	firstname?: string
	lastname?: string
	email?: string
	phone?: string
	address?: string
	postalCode?: string
	city?: string
	wantsCelebrationDate?: boolean
	// Données de l'offrande
	amount?: string
	paymentMethod?: "cheque" | "cash" | "card" | "transfer"
	brotherName?: string
	// Données de masse
	massCount?: number
	intention_type: 'unit' | 'thirty' | 'novena';
	//massType?: string
	dateType?: string
	// Données de récurrence

}

// Type pour la réponse de prévisualisation avec une structure simplifiée des masses
export interface MassPreview {
	masses: {
		date: string | null // peut être null pour les messes sans date assignée
		intention: string
		intention_type: 'unit' | 'thirty' | 'novena';
		celebrant_id: string | null // peut être null si non assigné
		celebrant_name: string
		status: MassStatus
	}[]
	totalAmount: string
	massCount: number
}

// Nouveau type pour la soumission finale basée sur la prévisualisation
export interface MassSubmission {
	id?: string
	preview: MassPreview
	donor: {
		firstName: string
		lastName: string
		email: string
		phone?: string
		address?: string
		postalCode?: string
		city?: string
		wantsCelebrationDate: boolean
	}
	payment: {
		amount: string
		paymentMethod: "cheque" | "cash" | "card" | "transfer"
		brotherName?: string
	}
}

const API_URL = `${API_BASE_URL}/api/data/masses`

export const massService = {
	getMasses: async (): Promise<Mass[]> => {
		const response = await axios.get(`${API_URL}`)
		const data = response.data
		return data.map((mass: any) => ({
			...mass,
			date: mass.date ? new Date(mass.date).toISOString().split("T")[0] : null,
		}))
	},

	getMassesByDateRange: async (startDate?: Date | null, endDate?: Date | null): Promise<Mass[]> => {
		let url = API_URL
		const params = new URLSearchParams()

		if (startDate) {
			const d = new Date(startDate)
			d.setHours(12, 0, 0, 0)
			params.append("startDate", d.toISOString().split("T")[0])
		}
		if (endDate) {
			const d = new Date(endDate)
			d.setHours(12, 0, 0, 0)
			params.append("endDate", d.toISOString().split("T")[0])
		}

		const queryString = params.toString()
		if (queryString) {
			url += `?${queryString}`
		}

		const response = await axios.get(url)
		return response.data.map((mass: any) => ({
			...mass,
			date: mass.date ? new Date(mass.date).toISOString().split("T")[0] : null,
		}))
	},

	updateMass: async (mass: Partial<Mass>)=> {
		const response = await axios.put(`${API_URL}/${mass.id}`, mass)
		return response.data
	},

	deleteMass: async (id: string) => {
		await axios.delete(`${API_URL}/${id}`)
	},
}
