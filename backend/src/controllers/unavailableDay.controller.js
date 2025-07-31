const UnavailableDay = require("../models/unavailableDay.model")
const Mass = require("../models/mass.model")

exports.getUnavailableDays = async (req, res) => {
	try {
		const { celebrant_id } = req.query
		let data
		if (celebrant_id) {
			data = await UnavailableDay.getByCelebrantId(celebrant_id)
		} else {
			data = await UnavailableDay.getAll()
		}
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.getUnavailableDay = async (req, res) => {
	try {
		const id = req.params.id
		const data = await UnavailableDay.getById(id)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.createUnavailableDay = async (req, res) => {
	try {
		const unavailableDay = {
			celebrant_id: req.body.celebrant_id,
			date: req.body.date,
			is_recurrent: req.body.is_recurrent,
		}
		const unavailableDayDate = new Date(unavailableDay.date).toISOString().split("T")[0] // "YYYY-MM-DD"
		// 1. Vérifie s'il y a déjà une messe à cette date
		const masses = await Mass.getAll()
		const hasMassOnSameDate = masses.some((mass) => {
			const massDate = new Date(mass.date).toISOString().split("T")[0]
			return massDate === unavailableDayDate
		})
		if (hasMassOnSameDate) {
			return res.status(400).json({
				message: "Impossible de créer ce jour indisponible pour ce célébrant : une ou plusieurs messes déjà programmée(s) à cette date.",
			})
		}
		// 2. Vérifie si un jour indisponible existe déjà (manuellement si besoin)
		const unavailableDays = await UnavailableDay.getByCelebrantId(unavailableDay.celebrant_id) // ou mieux : SpecialDay.findByDate(specialDayDate)
		const exists = unavailableDays.some((d) => {
			const dDate = new Date(d.date).toISOString().split("T")[0]
			return dDate === unavailableDayDate
		})
		if (exists) {
			return res.status(409).json({
				message: "Un jour indsponible existe déjà avec cette date pour ce célébrant.",
			})
		}

		await UnavailableDay.create(unavailableDay)
		res.status(201).send("Jour indisponible enregistré !")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'enregistrement du jour indisponible")
	}
}

exports.updateUnavailableDay = async (req, res) => {
	try {
		const unavailableDay = {
			id: req.params.id,
			date: req.body.date,
		}
		await UnavailableDay.update(unavailableDay)
		res.status(201).send("Jour indisponible mis à jour !")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la mise à jour du jour indisponible")
	}
}

exports.deleteUnavailableDay = async (req, res) => {
	try {
		const id = req.params.id
		await UnavailableDay.delete(id)
		res.status(201).send("Jour indisponible supprimé !")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la suppression du jour indisponible")
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
		const result = await UnavailableDay.deleteBeforeDate(parsedDate.toISOString())
		if (result > 0) {
			res.status(204).send()
		} else {
			res.status(404).json({ message: "Aucun jours indisponibles trouvés avant cette date." })
		}
	} catch (error) {
		console.error("Erreur lors de la suppression : ", error)
		res.status(500).send("Erreur lors de la suppression des jours indisponibles")
	}
}
