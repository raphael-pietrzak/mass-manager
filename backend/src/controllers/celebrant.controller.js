const Celebrant = require("../models/celebrant.model")

exports.getCelebrants = async (req, res) => {
	try {
		const data = await Celebrant.getAll()
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.getAvailableCelebrants = async (req, res) => {
	try {
		const { date } = req.query

		if (!date) {
			return res.status(400).json({ message: "La date est requise" })
		}

		const data = await Celebrant.getAvailableByDate(date)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Erreur lors de la récupération des célébrants disponibles" })
	}
}

exports.getCelebrant = async (req, res) => {
	try {
		const id = req.params.id
		const data = await Celebrant.getById(id)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.createCelebrant = async (req, res) => {
	try {
		const celebrant = {
			religious_name: req.body.religious_name,
			civil_firstname: req.body.civil_firstname,
			civil_lastname: req.body.civil_lastname,
			title: req.body.title,
			role: req.body.role,
		}
		await Celebrant.create(celebrant)
		res.status(201).send("Célébrant enregistré ! ")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'enregistrement du célébrant")
	}
}

exports.updateCelebrant = async (req, res) => {
	try {
		const celebrant = {
			id: req.params.id,
			religious_name: req.body.religious_name,
			civil_firstname: req.body.civil_firstname,
			civil_lastname: req.body.civil_lastname,
			title: req.body.title,
			role: req.body.role,
		}

		await Celebrant.update(celebrant)
		res.status(201).send("Célébrant mis à jour ! ")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la mise à jour du célébrant")
	}
}

exports.deleteCelebrant = async (req, res) => {
	try {
		const id = req.params.id

		// 1. Supprimer le célébrant
		await Celebrant.delete(id)

		// 2. Réaffecter les messes sans célébrant
		const massesToAffect = await db("Masses").whereNull("celebrant_id")
		const availableCelebrants = await Celebrant.getAvailableByDate()

		if (availableCelebrants.length >= massesToAffect.length) {
			for (let i = 0; i < massesToAffect.length; i++) {
				const mass = massesToAffect[i]
				const celebrant = availableCelebrants[i]

				// Mise à jour via la base de données
				await db("Masses").where({ id: mass.id }).update({ celebrant_id: celebrant.id })

			}
		} else {
			console.warn("Pas assez de célébrants disponibles pour toutes les messes.")
		}

		// 3. Réponse HTTP
		res.status(201).send("Célébrant supprimé et messes réaffectées !")
	} catch (error) {
		console.error("Erreur lors de la suppression ou de la réaffectation :", error)
		res.status(500).send("Erreur serveur.")
	}
}

exports.getUnavailableDates = async (req, res) => {
	try {
		const id = req.params.id
		const dates = await Celebrant.getUnavailableDates(id)
		res.json(dates)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Erreur lors de la récupération des dates d'indisponibilité" })
	}
}
