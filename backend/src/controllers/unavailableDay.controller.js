const UnavailableDay = require("../models/unavailableDay.model")

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
			celebrant_id: req.body.celebrant_id,
			date: req.body.date,
			is_recurrent: req.body.is_recurrent,
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
