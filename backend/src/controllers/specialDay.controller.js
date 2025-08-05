const SpecialDay = require("../models/specialDay.model")
const Mass = require("../models/mass.model")

exports.getSpecialDays = async (req, res) => {
	try {
		// Récupère les query params et les passe en filtres
		const filters = {}
		// Exemple : si la query contient number_of_masses, on l'ajoute
		if (req.query.number_of_masses !== undefined) {
			filters.number_of_masses = parseInt(req.query.number_of_masses, 10)
		}
		const data = await SpecialDay.getAll(filters)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.getSpecialDay = async (req, res) => {
	try {
		const id = req.params.id
		const data = await SpecialDay.getById(id)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.createSpecialDay = async (req, res) => {
	try {
		const specialDay = {
			date: req.body.date,
			description: req.body.description,
			number_of_masses: req.body.number_of_masses,
			is_recurrent: req.body.is_recurrent,
		}

		const specialDayDate = new Date(specialDay.date).toISOString().split("T")[0] // "YYYY-MM-DD"

		// 1. Vérifie s'il y a déjà une messe à cette date
		const masses = await Mass.getAll()
		const hasMassOnSameDate = masses.some((mass) => {
			const massDate = new Date(mass.date).toISOString().split("T")[0]
			return massDate === specialDayDate
		})

		if (hasMassOnSameDate) {
			return res.status(400).json({
				message:
					"Impossible de créer ce jour particulier : une ou plusieurs messes déjà programmée(s) à cette date.",
			})
		}

		// 2. Vérifie si un jour particulier existe déjà (manuellement si besoin)
		const specialDays = await SpecialDay.getAll() // ou mieux : SpecialDay.findByDate(specialDayDate)
		const exists = specialDays.some((d) => {
			const dDate = new Date(d.date).toISOString().split("T")[0]
			return dDate === specialDayDate
		})

		if (exists) {
			return res.status(409).json({
				message: "Un jour particulier avec cette date existe déjà.",
			})
		}

		// 3. Crée le jour particulier
		await SpecialDay.create(specialDay)
		res.status(201).send("Jour particulier enregistré !")

	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'enregistrement du jour particulier")
	}
}


exports.updateSpecialDay = async (req, res) => {
	try {
		const specialDay = {
			id: req.params.id,
			date: req.body.date,
			description: req.body.description,
			number_of_masses: req.body.number_of_masses,
			is_recurrent: req.body.is_recurrent,
		}
		await SpecialDay.update(specialDay)
		res.status(201).send("Jour particulier mis à jour !")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la mise à jour des jours particuliers")
	}
}

exports.deleteSpecialDay = async (req, res) => {
	try {
		const id = req.params.id
		await SpecialDay.delete(id)
		res.status(201).send("Jour particulier supprimé !")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la suppression des jours particuliers")
	}
}

exports.deleteBeforeDate = async (req, res) => {
	try {
		const date = req.query.date
		if (!date) {
			return res.status(400).json({ message: "La date est requise." })
		}
		const parsedDate = new Date(date)
		if (isNaN(parsedDate)) {
			return res.status(400).json({ message: "Date invalide." })
		}
		const result = await SpecialDay.deleteBeforeDate(parsedDate.toISOString())
		if (result > 0) {
			res.status(204).send()
		} else {
			res.status(404).json({ message: "Aucun jours spéciaux trouvés avant cette date." })
		}
	} catch (error) {
		console.error("Erreur lors de la suppression : ", error)
		res.status(500).send("Erreur lors de la suppression des jours spéciaux")
	}
}
