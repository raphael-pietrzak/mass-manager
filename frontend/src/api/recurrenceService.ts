import { IntentionWithRecurrence } from "../features/intentions/recurring/RecurringIntentionModal"
import apiClient from "./apiClient"
import { Masses } from "./intentionService"

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

export const recurrenceService = {
	getAll: (page = 1): Promise<PaginatedRecurringIntentions> => apiClient.get(`/data/recurrences?page=${page}`).then((response) => response.data),

	getById: (id: number): Promise<IntentionWithRecurrence> => apiClient.get(`/data/recurrences/${id}`).then((response) => response.data),

	previewMasses: async (data: Partial<IntentionWithRecurrence>) => {
		try {
			const response = await apiClient.post("/data/recurrences/preview", data)
			return response.data
		} catch (error: any) {
			// Axios stocke le message côté server dans error.response.data
			if (error.response && error.response.data && error.response.data.message) {
				throw new Error(error.response.data.message)
			}
			throw error // ou error.message
		}
	},

	create: (data: RecurringIntentionSubmission): Promise<{ recurrence_id: number; intention_id: string; masses_created: number }> =>
		apiClient.post("/data/recurrences", data).then((response) => response.data),

	update: (id: number, recurrence: Partial<Recurrence>): Promise<void> =>
		apiClient.put(`/data/recurrences/${id}`, recurrence).then((response) => response.data),

	delete: (id: number): Promise<void> => apiClient.delete(`/data/recurrences/${id}`),

	getActive: (): Promise<Recurrence[]> => apiClient.get("/data/recurrences/active").then((response) => response.data),

	getByType: (type: string): Promise<Recurrence[]> => apiClient.get(`/data/recurrences/type/${type}`).then((response) => response.data),
}
