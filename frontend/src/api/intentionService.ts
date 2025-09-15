import axios from "axios"
import { API_BASE_URL } from "."

import { MassStatus } from "./massService"

export type IntentionStatus = "pending" | "scheduled" | "cancelled" | "in_progress" | "completed"

export interface Intention {
	id: string
	date?: string
	intention_text?: string
	celebrant_id?: string
	celebrant_name?: string
	celebrant_title?: string
	status?: IntentionStatus
	deceased?: boolean
	intention_type: "unit" | "thirty" | "novena"
	number_of_masses?: number
	created_at: Date
	random_celebrant: boolean
	// Données du donateur
	donor_firstname?: string
	donor_lastname?: string
	donor_email?: string
	donor_phone?: string
	donor_address?: string
	donor_postal_code?: string
	donor_city?: string
	wants_celebration_date?: boolean
	donor_id?: number

	// Données de l'offrande
	amount?: string
	payment_method?: "cheque" | "cash" | "card" | "transfer"
	brother_name?: string | null

	// Données de masse
	mass_count?: number
	date_type?: "indifferent" | "desired" | "imperative"
}

export interface Masses {
	id?: string
	date: string | null // peut être null pour les messes sans date assignée
	celebrant_id: string | null // peut être null si non assigné
	celebrant_name: string
	celebrant_title: string
	status: MassStatus
	intention_id: number
	random_celebrant: number
}

export interface IntentionSubmission {
	id?: string
	masses: Masses[]
	donor: {
		firstname: string
		lastname: string
		email: string
		phone?: string
		address?: string
		postal_code?: string
		city?: string
		wants_celebration_date: boolean
	}
	intention_type: "unit" | "thirty" | "novena"
	number_of_masses: number
	date_type: "indifferent" | "desired" | "imperative"
	deceased?: boolean
	payment: {
		amount: string
		payment_method: "cheque" | "cash" | "card" | "transfer"
		brother_name?: string
	}
}

export interface IntentionWithMasses extends Intention {
	masses?: Masses[]
}

const API_URL = `${API_BASE_URL}/api/data/intentions`

export const intentionService = {
	async previewMasses(data: Partial<Intention>) {
		try {
			const response = await axios.post(`${API_URL}/preview`, data)
			return response.data
		} catch (error: any) {
			if (axios.isAxiosError(error) && error.response) {
				console.error("Erreur backend:", error.response.data)
				throw error.response.data
			}
			throw error
		}
	},

	async assignIntentions(intentionId: number) {
		try {
			const response = await axios.post(`${API_URL}/${intentionId}/assignMasses`)
			return response.data
		} catch (error: any) {
			if (error.response && error.response.data && error.response.data.message) {
				throw new Error(error.response.data.message)
			}
		}
	},

	async createMass(data: IntentionSubmission) {
		const response = await axios.post(`${API_URL}`, data)
		return response.data // Retourne les données de création
	},

	async updateMass(id: string, data: Partial<Intention>) {
		const response = await axios.put(`${API_URL}/${id}`, data)
		return response.data // Retourne les données mises à jour
	},

	async getIntentions(): Promise<IntentionWithMasses[]> {
		const response = await axios.get(`${API_URL}`)
		return response.data
	},

	async getIntentionById(id: string): Promise<IntentionWithMasses> {
		const response = await axios.get(`${API_URL}/${id}`)
		return response.data
	},

	async getIntentionMasses(id: string): Promise<Masses[]> {
		const response = await axios.get(`${API_URL}/${id}/masses`)
		return response.data
	},

	async getPonctualIntentions(status: string): Promise<Intention[]> {
		const response = await axios.get(`${API_URL}/ponctual?status=${status}`)
		return response.data
	},

	async deleteMass(id: string) {
		await axios.delete(`${API_URL}/${id}`)
	},
}
