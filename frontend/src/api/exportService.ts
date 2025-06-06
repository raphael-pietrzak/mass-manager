import axios from "axios"
import { API_BASE_URL } from "."
import { format } from "date-fns"

const EXPORT_URL = `${API_BASE_URL}/api/export/masses`
const EXPORTDON_URL = `${API_BASE_URL}/api/export/intentions`

export const exportService = {
	exportToExcel: async (startDate?: Date | null, endDate?: Date | null) => {
		let url = `${EXPORT_URL}/excel`
		if (startDate || endDate) {
			url += "?"
			if (startDate) url += `startDate=${startDate.toISOString()}`
			if (startDate && endDate) url += "&"
			if (endDate) url += `endDate=${endDate.toISOString()}`
		}
		const response = await axios.get(url, { responseType: "blob" })
		const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
		const link = document.createElement("a")
		link.href = blobUrl
		link.setAttribute("download", "Intentions de messes.xlsx")
		document.body.appendChild(link)
		link.click()
		link.remove()
	},

	exportToPdf: async (startDate?: Date | null, endDate?: Date | null) => {
		let url = `${EXPORT_URL}/pdf`
		if (startDate || endDate) {
			url += "?"
			if (startDate) url += `startDate=${startDate.toISOString()}`
			if (startDate && endDate) url += "&"
			if (endDate) url += `endDate=${endDate.toISOString()}`
		}
		const response = await axios.get(url, { responseType: "blob" })
		const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
		const link = document.createElement("a")
		link.href = blobUrl
		link.setAttribute("download", "Intentions de messes.pdf")
		document.body.appendChild(link)
		link.click()
		link.remove()
	},

	exportToWord: async (startDate?: Date | null, endDate?: Date | null) => {
		let url = `${EXPORT_URL}/word`
		if (startDate || endDate) {
			url += "?"
			if (startDate) url += `startDate=${format(startDate, "yyyy-MM-dd")}`
			if (startDate && endDate) url += "&"
			if (endDate) url += `endDate=${format(endDate, "yyyy-MM-dd")}`
		}
		const response = await axios.get(url, { responseType: "blob" })
		const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
		const link = document.createElement("a")
		link.href = blobUrl
		link.setAttribute("download", "Intentions de messes.docx")
		document.body.appendChild(link)
		link.click()
		link.remove()
	},

	exportIntentionToExcel: async (intentionIds: string[]) => {
		const url = `${EXPORTDON_URL}/excel/don`
		try {
			const response = await axios.post(url, { intentionIds }, { responseType: "blob" })
			const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
			const link = document.createElement("a")
			link.href = blobUrl
			link.setAttribute("download", "Intentions de messes.xlsx")
			document.body.appendChild(link)
			link.click()
			link.remove()
		} catch (error) {
			console.error("Erreur lors de l'export des intentions :", error)
		}
	},

	exportIntentionToWord: async (intentionIds: string[]) => {
		const url = `${EXPORTDON_URL}/word/don`
		try {
			const response = await axios.post(url, { intentionIds }, { responseType: "blob" })
			const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
			const link = document.createElement("a")
			link.href = blobUrl
			link.setAttribute("download", "Intentions de messes.docx")
			document.body.appendChild(link)
			link.click()
			link.remove()
		} catch (error) {
			console.error("Erreur lors de l'export des intentions :", error)
		}
	},

	exportIntentionToPdf: async (intentionIds: string[]) => {
		const url = `${EXPORTDON_URL}/pdf/don`
		try {
			const response = await axios.post(url, { intentionIds }, { responseType: "blob" })
			const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
			const link = document.createElement("a")
			link.href = blobUrl
			link.setAttribute("download", "Intentions de messes.pdf")
			document.body.appendChild(link)
			link.click()
			link.remove()
		} catch (error) {
			console.error("Erreur lors de l'export des intentions :", error)
		}
	},
}
