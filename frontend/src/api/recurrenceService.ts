import { IntentionWithRecurrence } from "../features/intentions/recurring/RecurringIntentionModal"
import { Masses } from "./intentionService"
import { API_BASE_URL } from "."
import axios from "axios"

export interface Recurrence {
	recurrence_id?: number
	type: "daily" | "weekly" | "monthly" | "relative_position" | "yearly"
	start_date: string
	end_type: "occurrences" | "date" | "no-end"
	occurrences?: number
	end_date?: string
	position?: "first" | "second" | "third" | "fourth" | "last"
	weekday?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
	created_at?: string
	updated_at?: string
}

export interface RecurringIntentionSubmission extends IntentionWithRecurrence {
	masses: Masses[]
}

export interface PaginatedRecurringIntentions {
	data: IntentionWithRecurrence[]
	pagination: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

const API_URL = `${API_BASE_URL}/api/data/recurrences`

export const recurrenceService = {
	getAll: (page = 1): Promise<PaginatedRecurringIntentions> => axios.get(`${API_URL}?page=${page}`).then((response) => response.data),

	getById: (id: number): Promise<IntentionWithRecurrence> => axios.get(`${API_URL}/${id}`).then((response) => response.data),

	previewMasses: async (data: Partial<IntentionWithRecurrence>) => {
		try {
			const response = await axios.post(`${API_URL}/preview`, data)
			return response.data
		} catch (error: any) {
			if (error.response && error.response.data && error.response.data.message) {
				throw new Error(error.response.data.message)
			}
			throw error
		}
	},

	create: (data: RecurringIntentionSubmission): Promise<{ recurrence_id: number; intention_id: string; masses_created: number }> =>
		axios.post(API_URL, data).then((response) => response.data),

	update: (id: number, recurrence: Partial<Recurrence>): Promise<void> =>
		axios.put(`${API_URL}/${id}`, recurrence).then((response) => response.data),

	delete: (id: number): Promise<void> => axios.delete(`${API_URL}/${id}`).then((response) => response.data),

	getActive: (): Promise<Recurrence[]> => axios.get(`${API_URL}/active`).then((response) => response.data),

	getByType: (type: string): Promise<Recurrence[]> => axios.get(`${API_URL}/type/${type}`).then((response) => response.data),
}
