const Intention = require("../models/intention.model")
const Donor = require("../models/donor.model")
const MassService = require("../services/mass.service")
const MassModel = require("../models/mass.model")
const Celebrant = require("../models/celebrant.model")

exports.getIntentions = async (req, res) => {
	try {
		const data = await Intention.getAll()
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.getIntention = async (req, res) => {
	try {
		const id = req.params.id
		const data = await Intention.findById(id)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.createIntention = async (req, res) => {
	console.log("Début création intention:", JSON.stringify(req.body, null, 2))
	try {
		const intentionData = req.body
		let donorId

		console.log("Traitement des données du donateur...")
		const donorData = {
			firstname: intentionData.donor.firstname,
			lastname: intentionData.donor.lastname,
			email: intentionData.donor.email || null,
			phone: intentionData.donor.phone || null,
			address: intentionData.donor.address || null,
			zip_code: intentionData.donor.postal_code || null,
			city: intentionData.donor.city || null,
		}

		console.log("Vérification existence donateur...")
		const existingDonor = await Donor.findByEmail(intentionData.donor.email)
		if (existingDonor) {
			console.log("Donateur existant trouvé:", existingDonor.id)
			donorId = existingDonor.id
		} else {
			console.log("Création nouveau donateur...")
			donorId = await Donor.create(donorData)
			console.log("Nouveau donateur créé:", donorId)
		}

		// Logique pour initialiser number_of_masses selon le type
		const intentionType = intentionData.intention_type.toLowerCase()
		let number = 0
		switch (intentionType) {
			case "novena":
				number = 9
				break
			case "thirty":
				number = 30
				break
			case "unit":
				number = intentionData.number_of_masses && intentionData.number_of_masses > 0 ? intentionData.number_of_masses : 1
				break
			default:
				number = 1
		}

		// Créer l'intention
		const intention = {
			donor_id: donorId,
			intention_text: intentionData.masses[0]?.intention || "Intention de messe",
			deceased: intentionData.deceased,
			amount: parseFloat(intentionData.payment.amount),
			payment_method: intentionData.payment.payment_method,
			brother_name: intentionData.payment.brother_name || null,
			wants_celebration_date: intentionData.donor.wants_celebration_date,
			date_type: intentionData.date_type,
			intention_type: intentionType,
			number_of_masses: number,
		}

		const intentionId = await Intention.create(intention)
		console.log("Intention créée:", intentionId)

		console.log("Traitement des messes associées...")
		if (intentionData.masses && intentionData.masses.length > 0) {
			console.log(`${intentionData.masses.length} messes à créer`)
			const assignedCelebrantsByDate = new Map()

			for (const mass of intentionData.masses) {
				console.log("Traitement messe:", JSON.stringify(mass, null, 2))
				const massDate = mass.date
				const celebrantId = mass.celebrant_id

				if (celebrantId && massDate) {
					const dateKey = new Date(massDate).toISOString().split("T")[0]
					console.log(`Vérification disponibilité célébrant ${celebrantId} pour ${dateKey}`)

					if (assignedCelebrantsByDate.has(dateKey) && assignedCelebrantsByDate.get(dateKey) === celebrantId) {
						console.log("Célébrant déjà assigné pour cette date, messe ignorée")
						continue
					}

					const isCelebrantAvailable = await MassModel.isCelebrantAvailable(celebrantId, dateKey)
					if (!isCelebrantAvailable) {
						console.log("Célébrant non disponible, assignation annulée")
						mass.celebrant_id = null
					} else {
						console.log("Célébrant disponible et assigné")
						assignedCelebrantsByDate.set(dateKey, celebrantId)
					}
				}

				const massData = {
					date: mass.date,
					intention_id: intentionId,
					celebrant_id: mass.celebrant_id || null,
					status: mass.status,
				}

				await MassModel.create(massData)
				console.log("Messe créée avec succès")
			}
		}

		console.log("Récupération données finales...")
		const result = await Intention.findById(intentionId)
		console.log("Opération terminée avec succès")
		if (result.date_type === "imperative" || result.date_type === "desired") {
			await Intention.update(result.id, { status: "in_progress" })
		}
		res.status(201).json(result)
	} catch (error) {
		console.error("Erreur détaillée lors de la création de l'intention:", error)
		res.status(500).json({ message: "Erreur lors de la création de l'intention" })
	}
}

exports.updateIntention = async (req, res) => {
	try {
		const id = req.params.id
		const intentionData = {
			intention_text: req.body.intention_text,
			type: req.body.type,
			amount: req.body.amount,
			payment_method: req.body.payment_method,
			brother_name: req.body.brother_name,
			deceased: req.body.deceased,
			wants_celebration_date: req.body.wants_celebration_date,
			date_type: req.body.date_type,
			is_recurrent: req.body.is_recurrent,
			recurrence_type: req.body.recurrence_type,
			occurrences: req.body.occurrences,
			start_date: req.body.start_date,
			end_type: req.body.end_type,
			end_date: req.body.end_date,
		}

		await Intention.update(id, intentionData)
		res.status(204).send()
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la mise à jour de l'intention")
	}
}

exports.deleteIntention = async (req, res) => {
	try {
		const id = req.params.id
		await Intention.delete(id)
		//await db.raw("PRAGMA foreign_keys = ON")
		//await db("Intentions").where({ id }).del()
		res.status(204).send()
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la suppression de l'intention")
	}
}

exports.previewIntention = async (req, res) => {
	console.log("Début prévisualisation intention:", JSON.stringify(req.body, null, 2))
	try {
		const preview = await MassService.generateMassPreview({
			celebrant_id: req.body.celebrant_id,
			intention_text: req.body.intention_text,
			deceased: req.body.deceased,
			mass_count: req.body.mass_count,
			intention_type: req.body.intention_type,
			date_type: req.body.date_type,
			is_recurrent: req.body.is_recurrent,
			recurrence_type: req.body.recurrence_type,
			occurrences: req.body.occurrences,
			start_date: req.body.date,
			end_date: req.body.end_date,
			end_type: req.body.end_type,
		})
		console.log("Prévisualisation générée:", JSON.stringify(preview, null, 2))
		res.status(200).json(preview)
	} catch (error) {
		console.error("Erreur détaillée lors de la prévisualisation:", error)
		//res.status(500).json({ message: "Erreur lors de la prévisualisation de l'intention" })
		res.status(400).json({ message: error.message })
	}
}

exports.getIntentionMasses = async (req, res) => {
	try {
		const intentionId = req.params.id
		const masses = await MassModel.getMassesByIntentionId(intentionId)

		// Transformer les données pour correspondre au format attendu par le frontend
		const formattedMasses = masses.map((mass) => ({
			date: mass.date ? new Date(mass.date).toISOString().split("T")[0] : null,
			intention: mass.intention || "",
			type: mass.deceased ? "defunts" : "vivants",
			celebrant_id: mass.celebrant_id || null,
			celebrant_name: mass.celebrant_name || "",
			celebrant_title: mass.celebrant_title || "",
			status: mass.status,
			intention_id: mass.intention_id,
		}))

		res.json(formattedMasses)
	} catch (error) {
		console.error("Erreur lors de la récupération des messes associées:", error)
		res.status(500).json({ message: "Erreur lors de la récupération des messes associées" })
	}
}

exports.getPonctualIntentions = async (req, res) => {
	try {
		const {status} = req.query
		const data = await Intention.getPonctualIntentions(status)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des intentions ponctuelles")
	}
}

exports.deleteBeforeDate = async (req, res) => {
	try {
		const result = await Intention.deleteBeforeDate()
		if (result > 0) {
			res.status(204).send()
		} else {
			res.status(404).json({ message: "Aucune intentions trouvées avant cette date." })
		}
	} catch (error) {
		console.error("Erreur lors de la suppression : ", error)
		res.status(500).send("Erreur lors de la suppression des intentions")
	}
}

exports.assignToExistingMasses = async (req, res) => {
	try {
		const intentionId = req.params.id

		// Récupérer l'intention (à adapter selon ton modèle)
		const intention = await Intention.findById(intentionId)
		if (!intention) {
			return res.status(404).json({ error: "Intention non trouvée" })
		}
		let updatedMasses = []
		if (intention.intention_type === "unit") {
			updatedMasses = await MassService.assignToExistingMasses([intention])
			const now = new Date()
			const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10)
			const startDate = new Date(now.getFullYear(), now.getMonth() + offset, 1)
			startDate.setHours(12, 0, 0, 0)
			const formattedMonth = startDate.toLocaleDateString("fr-FR", {
				year: "numeric",
				month: "long",
			})
			if (updatedMasses?.error) {
				const baseMessage = `Répartition impossible, mois (${formattedMonth}) complet`
				if (updatedMasses.type === "noDateForCelebrant") {
					const celebrant = await Celebrant.getById(updatedMasses.celebrantId)
					return res.status(422).json({
						message: `${baseMessage} pour le célébrant (${celebrant.celebrant_title} ${celebrant.religious_name})`,
					})
				} else {
					return res.status(422).json({
						message: baseMessage,
					})
				}
			}
		} else {
			updatedMasses = await MassService.assignNeuvaineOrTrentain([intention])
		}
		res.json(updatedMasses)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Erreur lors de l'assignation des messes" })
	}
}
