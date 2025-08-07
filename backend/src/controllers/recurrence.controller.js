const Recurrence = require("../models/recurrence.model")
const Mass = require("../models/mass.model")
const Intention = require("../models/intention.model")
const { addDays, parseISO, format } = require("date-fns")
const Donor = require("../models/donor.model")

exports.getRecurrences = async (req, res) => {
	console.log("Récupération de toutes les récurrences")
	try {
		const data = await Recurrence.getAll()
		console.log(`${data.length} récurrences trouvées`)
		res.json(data)
	} catch (error) {
		console.error("Erreur getRecurrences:", error)
		res.status(500).send("Erreur lors de la récupération des récurrences")
	}
}

exports.getRecurrence = async (req, res) => {
	try {
		const id = req.params.id
		const data = await Recurrence.getById(id)
		if (!data) {
			return res.status(404).json({ message: "Récurrence non trouvée" })
		}
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération de la récurrence")
	}
}

exports.createRecurrence = async (req, res) => {
	console.log("Début création récurrence:", JSON.stringify(req.body, null, 2))
	try {
		const recurrence = {
			type: req.body.type,
			start_date: req.body.start_date,
			end_type: req.body.end_type,
			occurrences: req.body.occurrences || null,
			end_date: req.body.end_date || null,
			position: req.body.position || null,
			weekday: req.body.weekday || null,
		}

		// Validation de la récurrence
		if (!recurrence.type || !recurrence.start_date || !recurrence.end_type) {
			console.log("Validation échouée: champs requis manquants")
			return res.status(400).json({ message: "Type, date de début et type de fin sont requis" })
		}

		if (recurrence.end_type === "occurrences" && !recurrence.occurrences) {
			console.log("Validation échouée: nombre d'occurrences manquant")
			return res.status(400).json({ message: "Le nombre d'occurrences est requis" })
		}

		if (recurrence.end_type === "date" && !recurrence.end_date) {
			console.log("Validation échouée: date de fin manquante")
			return res.status(400).json({ message: "La date de fin est requise" })
		}

		console.log("Création de la récurrence...")
		const recurrenceId = await Recurrence.create(recurrence)
		console.log("Récurrence créée avec ID:", recurrenceId[0].id)

		// Données du donateur
		const donorData = {
			firstname: req.body.donor_firstname,
			lastname: req.body.donor_lastname,
			email: req.body.donor_email || null,
			phone: req.body.donor_phone || null,
			address: req.body.donor_address || null,
			zip_code: req.body.donor_postal_code || null,
			city: req.body.donor_city || null,
		}

		let donorId
		console.log("Vérification existence donateur...")
		const existingDonor = await Donor.findByEmail(req.body.donor_email)
		if (existingDonor) {
			console.log("Donateur existant trouvé:", existingDonor.id)
			donorId = existingDonor.id
		} else {
			console.log("Création nouveau donateur...")
			donorId = await Donor.create(donorData)
			console.log("Nouveau donateur créé:", donorId)
		}

		// Créer l'intention associée - Correction de l'ID de récurrence
		const intention = {
			donor_id: donorId,
			intention_text: req.body.intention_text,
			deceased: req.body.deceased,
			amount: req.body.amount,
			payment_method: req.body.payment_method,
			recurrence_id: recurrenceId[0].id,
			status: "pending",
			brother_name: req.body.brother_name || null,
			wants_celebration_date: req.body.wants_celebration_date,
			date_type: "imperative"
		}

		const intentionId = await Intention.create(intention)
		console.log("Intention créée avec ID:", intentionId)

		// Générer les dates des messes
		console.log("Génération des messes...")
		const startDate = parseISO(recurrence.start_date)
		const endDate = recurrence.end_date ? parseISO(recurrence.end_date) : null
		let currentDate = startDate
		let occurrenceCount = 0
		const masses = []
		console.log("Date de début:", format(startDate, "yyyy-MM-dd"))
		console.log("Date de fin:", endDate ? format(endDate, "yyyy-MM-dd") : "Aucune")
		console.log("End Type:", recurrence.end_type)
		console.log("Occurrences:", recurrence.occurrences || "Aucune")
		console.log("Position:", recurrence.position || "Aucune")
		console.log("Jour de la semaine:", recurrence.weekday !== null ? recurrence.weekday : "Aucun")
		while (
			(recurrence.end_type === "date" && currentDate <= endDate) ||
			(recurrence.end_type === "occurrences" && occurrenceCount < recurrence.occurrences)
		) {
			console.log("Traitement de la date:", format(currentDate, "yyyy-MM-dd"))
			console.log("Création messe pour la date:", format(currentDate, "yyyy-MM-dd"))
			console.log("Traitement de la date:", format(currentDate, "yyyy-MM-dd"))
			console.log("Création messe pour la date:", format(currentDate, "yyyy-MM-dd"))
			const massData = {
				//date: format(currentDate, "yyyy-MM-dd"),
				celebrant_id: req.body.celebrant_id || null,
				intention_id: intentionId,
				status: "pending",
			}
			await Mass.create(massData)
			masses.push(massData)
			occurrenceCount++
			currentDate = addDays(currentDate, 1)
		}

		console.log(`${masses.length} messes créées avec succès`)
		res.status(201).json({
			message: "Récurrence, intention et messes créées avec succès",
			recurrence_id: recurrenceId[0].id,
			intention_id: intentionId,
			masses_created: masses.length,
		})
	} catch (error) {
		console.error("Erreur création récurrence:", error)
		res.status(500).send("Erreur lors de la création de la récurrence")
	}
}

exports.updateRecurrence = async (req, res) => {
	try {
		const recurrence = {
			id: req.params.id,
			type: req.body.type,
			start_date: req.body.start_date,
			end_type: req.body.end_type,
			occurrences: req.body.occurrences || null,
			end_date: req.body.end_date || null,
			position: req.body.position || null,
			weekday: req.body.weekday || null,
		}

		await Recurrence.update(recurrence)
		res.status(200).json({ message: "Récurrence mise à jour avec succès" })
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la mise à jour de la récurrence")
	}
}

exports.deleteRecurrence = async (req, res) => {
	try {
		const id = req.params.id
		// 1. Trouver l’intention associée à la récurrence
		const intention = await Intention.findByRecurrenceId(id)
		if (!intention) {
			return res.status(404).json({ message: "Aucune intention liée à cette récurrence" })
		}
		// 2. Récupérer toutes les messes liées à cette intention
		// et les supprimer toutes
		const masses = await Mass.getMassesByIntentionId(intention.id)
		for (const mass of masses) {
			await Mass.delete(mass.id)
		}

		// 3. Supprimer l’intention
		await Intention.delete(intention.id)

		// 4. Supprimer la récurrence
		await Recurrence.delete(id)
		res.status(200).json({ message: "Récurrence supprimée avec succès" })
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la suppression de la récurrence")
	}
}

exports.getActiveRecurrences = async (req, res) => {
	try {
		const data = await Recurrence.getActiveRecurrences()
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des récurrences actives")
	}
}

exports.getRecurrencesByType = async (req, res) => {
	try {
		const { type } = req.params
		const data = await Recurrence.getByType(type)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des récurrences par type")
	}
}
