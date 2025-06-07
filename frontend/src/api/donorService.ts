import axios from "axios"
import { API_BASE_URL } from "."

export interface Donor {
	id: number
	firstname: string
	lastname: string
	email?: string
	phone?: string
	address?: string
	city?: string
	zip_code?: string
}

const API_URL = `${API_BASE_URL}/api/data`

class DonorService {
	async getDonors(): Promise<Donor[]> {
		try {
			const response = await axios.get(`${API_URL}/donors`)
			return response.data
		} catch (error) {
			console.error("Erreur lors de la récupération des donateurs:", error)
			return []
		}
	}

	async createDonor(donor: Donor): Promise<string> {
		try {
			const response = await axios.post(`${API_URL}/donors`, donor)
			return response.data // "Donateur enregistré !" si tout va bien
		} catch (error: any) {
			if (axios.isAxiosError(error) && error.response) {
				throw new Error(error.response.data) // renvoie "Un donateur avec cet email existe déjà !"
			}
			throw new Error("Erreur réseau.")
		}
	}

	async getDonorById(id: number): Promise<Donor> {
		const response = await axios.get(`${API_URL}/donors/${id}`)
		return response.data
	}

	async updateDonor(id: number, donor: Donor): Promise<string> {
		const response = await axios.put(`${API_URL}/donors/${id}`, donor)
		return response.data
	}

	async deleteDonor(id: number): Promise<void> {
		await axios.delete(`${API_URL}/donors/${id}`)
	}
}

export const donorsService = new DonorService()
