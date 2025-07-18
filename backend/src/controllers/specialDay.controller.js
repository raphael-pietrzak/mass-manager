const SpecialDay = require("../models/specialDay.model")

exports.getSpecialDays = async (req, res) => {
	try {
		const data = await SpecialDay.getAll()
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

		await SpecialDay.create(specialDay)
		res.status(201).send("Jour particulier enregistrée !")
	} catch (error) {
		console.error(error)
		// Vérifier si c'est une erreur de contrainte unique (SQLite error code 19)
    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: SpecialDays.date')) {
      return res.status(400).json({ message: "Un jour particulier avec cette date existe déjà." })
    }
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
