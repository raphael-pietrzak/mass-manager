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
			// Vérifier si les données sont un tableau
			if (Array.isArray(response.data)) {
				return response.data
			} else if (response.data && typeof response.data === "object") {
				// Si c'est un objet qui contient un tableau (par exemple { donors: [...] })
				const possibleArrays = Object.values(response.data).filter(Array.isArray)
				if (possibleArrays.length > 0) {
					return possibleArrays[0] as Donor[]
				}
			}

			// Si on ne trouve pas de tableau, on renvoie un tableau vide
			console.error("Format de données inattendu:", response.data)
			return []
		} catch (error) {
			console.error("Erreur lors de la récupération des donateurs:", error)
			return []
		}
	}

	async getDonorsPaginated(limit: number, page: number, searchQuery?: string): Promise<{ donors: Donor[]; totalPages: number }> {
		try {
			// Envoi de la requête GET avec limit et page dans les paramètres de la query
			const response = await axios.get(`${API_URL}/donors`, {
				params: { limit, page, searchQuery },
			})
			return response.data // Les données retournées contiennent les donateurs et les informations de pagination
		} catch (error) {
			console.error("Erreur lors de la récupération des donateurs", error)
			throw new Error("Erreur lors de la récupération des donateurs")
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
