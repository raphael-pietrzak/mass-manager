import axios from "axios"
import { API_BASE_URL } from "."
import { format } from "date-fns"

const EXPORT_URL = `${API_BASE_URL}/api/export/masses`
const EXPORTDON_URL = `${API_BASE_URL}/api/export/intentions`

const downloadBlob = (blobData: BlobPart, filename: string) => {
	const blobUrl = window.URL.createObjectURL(new Blob([blobData]))
	const link = document.createElement("a")
	link.href = blobUrl
	link.setAttribute("download", filename)
	document.body.appendChild(link)
	link.click()
	link.remove()
}

const buildQueryParams = (startDate?: Date | null, endDate?: Date | null, useFormattedDates = false) => {
	const params = new URLSearchParams()
	if (startDate) params.append("startDate", useFormattedDates ? format(startDate, "yyyy-MM-dd") : startDate.toISOString())
	if (endDate) params.append("endDate", useFormattedDates ? format(endDate, "yyyy-MM-dd") : endDate.toISOString())
	return params.toString() ? `?${params.toString()}` : ""
}

const getFileExtension = (format: "excel" | "pdf" | "word") => {
	switch (format) {
		case "excel":
			return "xlsx"
		case "pdf":
			return "pdf"
		case "word":
			return "docx"
	}
}

const exportMasses = async (formatType: "excel" | "pdf" | "word", startDate?: Date | null, endDate?: Date | null) => {
	const useFormattedDates = formatType === "word"
	const query = buildQueryParams(startDate, endDate, useFormattedDates)
	const url = `${EXPORT_URL}/${formatType}${query}`
	const response = await axios.get(url, { responseType: "blob" })
	const extension = getFileExtension(formatType)
	downloadBlob(response.data, `Intentions de messes.${extension}`)
}

const exportIntentions = async (formatType: "excel" | "pdf" | "word", intentionIds: string[]) => {
	const url = `${EXPORTDON_URL}/${formatType}/don`
	const extension = getFileExtension(formatType)
	const filename = `Intentions de messes.${extension}`
	try {
		const response = await axios.post(url, { intentionIds }, { responseType: "blob" })
		downloadBlob(response.data, filename)
	} catch (error) {
		console.error("Erreur lors de l'export des intentions :", error)
	}
}

export const exportService = {
	exportToExcel: (startDate?: Date | null, endDate?: Date | null) => exportMasses("excel", startDate, endDate),

	exportToPdf: (startDate?: Date | null, endDate?: Date | null) => exportMasses("pdf", startDate, endDate),

	exportToWord: (startDate?: Date | null, endDate?: Date | null) => exportMasses("word", startDate, endDate),

	exportIntentionToExcel: (intentionIds: string[]) => exportIntentions("excel", intentionIds),

	exportIntentionToPdf: (intentionIds: string[]) => exportIntentions("pdf", intentionIds),

	exportIntentionToWord: (intentionIds: string[]) => exportIntentions("word", intentionIds),
}
