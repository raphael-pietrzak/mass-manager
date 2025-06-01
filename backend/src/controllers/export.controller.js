const Intention = require("../models/intention.model")
const Mass = require("../models/mass.model")
const exportService = require("../services/export.service")

exports.exportToExcel = async (req, res) => {
	try {
		const { startDate, endDate } = req.query

		// Récupérer les masses selon les filtres de date fournis

		const masses = await Mass.getMassesByDateRange(startDate, endDate)

		// Générer le fichier Excel
		const buffer = await exportService.generateExcel(masses)

		// Envoyer le fichier
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		res.setHeader("Content-Disposition", 'attachment; filename="intentions-messes.xlsx"')
		res.send(buffer)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'exportation vers Excel")
	}
}

exports.exportToPdf = async (req, res) => {
	try {
		const { startDate, endDate } = req.query

		// Récupérer les masses selon les filtres de date fournis
		const masses = await Mass.getMassesByDateRange(startDate, endDate)

		// Générer le PDF
		const buffer = await exportService.generatePDF(masses)

		// Envoyer le PDF
		res.setHeader("Content-Type", "application/pdf")
		res.setHeader("Content-Disposition", 'attachment; filename="intentions-messes.pdf"')
		res.send(buffer)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'exportation vers PDF")
	}
}

exports.exportToWord = async (req, res) => {
	try {
		const { startDate, endDate } = req.query

		// Récupérer les masses selon les filtres de date fournis
		const masses = await Mass.getMassesByDateRange(startDate, endDate)

		// Générer le fichier Word
		const buffer = await exportService.generateWord(masses)

		// Envoyer le document Word
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
		res.setHeader("Content-Disposition", 'attachment; filename="intentions-messes.docx"')
		res.send(buffer)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'exportation vers Word")
	}
}

exports.exportIntentionToExcel = async (req, res) => {
	try {
		const { intentionIds } = req.body

		if (!Array.isArray(intentionIds) || intentionIds.length === 0) {
			return res.status(400).json({ error: "Aucun ID d'intention fourni." })
		}

		// Convertir les ID en nombre (attention aux NaN)
		const numericIds = intentionIds.map((id) => {
			const n = Number(id)
			if (isNaN(n)) throw new Error(`ID non valide : ${id}`)
			return n
		})

		// Récupérer chaque intention
		const intentions = await Promise.all(
			numericIds.map(async (id) => {
				try {
					return await Intention.findById(id) // id est bien un Number
				} catch (err) {
					console.error(`Erreur lors de la récupération de l'intention avec l'id ${id}:`, err)
					return null
				}
			})
		)

		// Filtrer les null (ID introuvables ou erreurs)
		const validIntentions = intentions.filter((i) => i !== null)

		if (validIntentions.length === 0) {
			return res.status(404).json({ error: "Aucune intention trouvée." })
		}

		// Générer le fichier Excel à partir des intentions
		const buffer = await exportService.generateExcelIntention(validIntentions)

		// Envoyer le fichier
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		res.setHeader("Content-Disposition", 'attachment; filename="intentions-don.xlsx"')
		res.send(buffer)
	} catch (error) {
		console.error("Erreur exportIntentionToExcel:", error)
		res.status(500).send("Erreur lors de l'exportation des intentions vers Excel.")
	}
}

exports.exportIntentionToWord = async (req, res) => {
	try {
		const { intentionIds } = req.body

		if (!Array.isArray(intentionIds) || intentionIds.length === 0) {
			return res.status(400).json({ error: "Aucun ID d'intention fourni." })
		}

		// Convertir les ID en nombre (attention aux NaN)
		const numericIds = intentionIds.map((id) => {
			const n = Number(id)
			if (isNaN(n)) throw new Error(`ID non valide : ${id}`)
			return n
		})

		// Récupérer chaque intention
		const intentions = await Promise.all(
			numericIds.map(async (id) => {
				try {
					return await Intention.findById(id) // id est bien un Number
				} catch (err) {
					console.error(`Erreur lors de la récupération de l'intention avec l'id ${id}:`, err)
					return null
				}
			})
		)

		// Filtrer les null (ID introuvables ou erreurs)
		const validIntentions = intentions.filter((i) => i !== null)

		if (validIntentions.length === 0) {
			return res.status(404).json({ error: "Aucune intention trouvée." })
		}

		// Générer le fichier Word à partir des intentions
		const buffer = await exportService.generateWordIntention(validIntentions)

		// Envoyer le fichier Word
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
		res.setHeader("Content-Disposition", 'attachment; filename="intentions-don.docx"')
		res.send(buffer)
	} catch (error) {
		console.error("Erreur exportIntentionToWord:", error)
		res.status(500).send("Erreur lors de l'exportation des intentions vers Word.")
	}
}

exports.exportIntentionToPdf = async (req, res) => {
	try {
		const { intentionIds } = req.body

		if (!Array.isArray(intentionIds) || intentionIds.length === 0) {
			return res.status(400).json({ error: "Aucun ID d'intention fourni." })
		}

		// Convertir les IDs en nombres et vérifier qu'ils sont valides
		const numericIds = intentionIds.map((id) => {
			const n = Number(id)
			if (isNaN(n)) throw new Error(`ID non valide : ${id}`)
			return n
		})

		// Récupérer les intentions en base de données
		const intentions = await Promise.all(
			numericIds.map(async (id) => {
				try {
					return await Intention.findById(id)
				} catch (err) {
					console.error(`Erreur récupération intention id ${id}:`, err)
					return null
				}
			})
		)

		const validIntentions = intentions.filter((i) => i !== null)

		if (validIntentions.length === 0) {
			return res.status(404).json({ error: "Aucune intention trouvée." })
		}

		// Générer le PDF à partir des intentions
		const buffer = await exportService.generatePDFIntention(validIntentions)

		// Envoyer le PDF
		res.setHeader("Content-Type", "application/pdf")
		res.setHeader("Content-Disposition", 'attachment; filename="intentions-don.pdf"')
		res.send(buffer)
	} catch (error) {
		console.error("Erreur exportIntentionToPdf:", error)
		res.status(500).send("Erreur lors de l'exportation des intentions vers PDF.")
	}
}
