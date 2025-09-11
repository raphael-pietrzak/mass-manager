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

export const recurrenceService = {
	getAll: (): Promise<IntentionWithRecurrence[]> => apiClient.get("/data/recurrences").then((response) => response.data),

	getById: (id: number): Promise<IntentionWithRecurrence> => apiClient.get(`/data/recurrences/${id}`).then((response) => response.data),

	previewMasses: (
		data: Partial<IntentionWithRecurrence> //: Promise<{ date: string; celebrant_id: number; intention_id: number; status: string }>
	) => apiClient.post("/data/recurrences/preview", data).then((response) => response.data),

	create: (data: RecurringIntentionSubmission): Promise<{ recurrence_id: number; intention_id: string; masses_created: number }> =>
		apiClient.post("/data/recurrences", data).then((response) => response.data),

	update: (id: number, recurrence: Partial<Recurrence>): Promise<void> =>
		apiClient.put(`/data/recurrences/${id}`, recurrence).then((response) => response.data),

	delete: (id: number): Promise<void> => apiClient.delete(`/data/recurrences/${id}`),

	getActive: (): Promise<Recurrence[]> => apiClient.get("/data/recurrences/active").then((response) => response.data),

	getByType: (type: string): Promise<Recurrence[]> => apiClient.get(`/data/recurrences/type/${type}`).then((response) => response.data),
}
