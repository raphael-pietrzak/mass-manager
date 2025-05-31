const Recurrence = require("../models/recurrence.model")

exports.getRecurrences = async (req, res) => {
	try {
		const data = await Recurrence.getAll()
		res.json(data)
	} catch (error) {
		console.error(error)
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
	try {
		const recurrence = {
			type: req.body.type,
			start_date: req.body.start_date,
			end_type: req.body.end_type,
			occurrences: req.body.occurrences || null,
			end_date: req.body.end_date || null,
			position: req.body.position || null,
			weekday: req.body.weekday || null
		}

		// Validation
		if (!recurrence.type || !recurrence.start_date || !recurrence.end_type) {
			return res.status(400).json({ message: "Type, date de début et type de fin sont requis" })
		}

		if (recurrence.end_type === 'occurrences' && !recurrence.occurrences) {
			return res.status(400).json({ message: "Le nombre d'occurrences est requis" })
		}

		if (recurrence.end_type === 'date' && !recurrence.end_date) {
			return res.status(400).json({ message: "La date de fin est requise" })
		}

		if (recurrence.type === 'relative_position' && (!recurrence.position || !recurrence.weekday)) {
			return res.status(400).json({ message: "Position et jour de la semaine requis pour la récurrence relative mensuelle" })
		}

		const result = await Recurrence.create(recurrence)
		res.status(201).json({ message: "Récurrence créée avec succès", id: result[0] })
	} catch (error) {
		console.error(error)
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
			weekday: req.body.weekday || null
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
