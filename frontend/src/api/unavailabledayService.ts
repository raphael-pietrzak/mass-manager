import axios from "axios"
import { API_BASE_URL } from "."

export interface UnavailableDays {
	id?: string
	celebrant_id: number
	date: string // format YYYY-MM-DD
	is_recurrent?: boolean
}

const API_URL = `${API_BASE_URL}/api/data`

export const unavailableDayService = {
	getUnavailableDays: async (celebrant_id?: number): Promise<UnavailableDays[]> => {
		try {
			const response = await axios.get(`${API_URL}/unavailable-days?celebrant_id=${celebrant_id}`)
			const data = response.data
			return data.map((unavailableDay: UnavailableDays) => ({
				...unavailableDay,
				date: new Date(unavailableDay.date).toISOString().split("T")[0], // format YYYY-MM-DD
			}))
		} catch (error) {
			console.error("Erreur lors de la récupération des jours indisponibles :", error)
			throw new Error("Erreur lors de la récupération des jours indisponibles")
		}
	},

	createUnavailableDay: async (unavailableDay: UnavailableDays): Promise<string> => {
		try {
			const response = await axios.post(`${API_URL}/unavailable-days`, unavailableDay)
			return response.data
		} catch (error) {
			console.error("Erreur lors de la création du jour indisponible : ", error)
			throw new Error("Erreur lors de la création du jour indisponible")
		}
	},

	updateUnavailableDay: async (id: string, unavailableDay: UnavailableDays): Promise<string> => {
		try {
			const response = await axios.put(`${API_URL}/unavailable-days/${id}`, unavailableDay)
			return response.data
		} catch (error) {
			console.error("Erreur lors de la mise à jour du jour indisponible: ", error)
			throw new Error("Erreur lors de la mise à jour du jour indisponible")
		}
	},

	deleteUnavailableDay: async (id: string): Promise<string> => {
		try {
			const response = await axios.delete(`${API_URL}/unavailable-days/${id}`)
			return response.data
		} catch (error) {
			console.error("Erreur lors de la suppression du jour indisponible: ", error)
			throw new Error("Erreur lors de la suppression du jour indisponible")
		}
	},
}
