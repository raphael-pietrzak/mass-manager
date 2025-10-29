// donor.controller.js
const Donor = require("../models/donor.model")

exports.getDonors = async (req, res) => {
	try {
		const data = await Donor.getAll()
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}

exports.getDonor = async (req, res) => {
	try {
		const id = req.params.id
		const data = await Donor.getById(id)
		res.json(data)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération des données")
	}
}
exports.createDonor = async (req, res) => {
	try {
		const donorData = {
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			phone: req.body.phone,
			address: req.body.address,
			city: req.body.city,
			zip_code: req.body.zip_code,
		}
		const existingDonor = await Donor.findByEmail(donorData.email)
		if (existingDonor) {
			return res.status(409).send("Un donateur avec cet email existe déjà !")
		}
		await Donor.create(donorData)
		res.status(201).send("Donateur enregistré !")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'enregistrement du donateur")
	}
}

exports.updateDonor = async (req, res) => {
	try {
		const id = req.params.id
		const donorData = {
			//id: req.params.id,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			phone: req.body.phone,
			address: req.body.address,
			city: req.body.city,
			zip_code: req.body.zip_code,
		}

		await Donor.update(id, donorData)
		res.status(201).send("Donateur mis à jour !")
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la mise à jour du donateur")
	}
}

exports.deleteDonor = async (req, res) => {
	try {
		const id = req.params.id
		await Donor.delete(id)
		res.status(204).send()
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la suppression du donateur")
	}
}

exports.deleteBeforeDate = async (req, res) => {
	try {
		const date = req.query.date
		if (!date || isNaN(new Date(date).getTime())) {
			return res.status(400).json({ error: "Date invalide ou manquante." })
		}
		const result = await Donor.deleteBeforeDate(date)
		if (result > 0) {
			return res.status(200).json({
				message: `${result} donateurs inactifs depuis le ${date} ont été supprimées.`,
			})
		} else {
			return res.status(204).json({
				message: `Aucun donateur inactifs trouvé avant le ${date}.`,
			})
		}
	} catch (error) {
		console.error("Erreur lors de la suppression : ", error)
		res.status(500).send("Erreur lors de la suppression des donateurs")
	}
}

exports.getDonorByEmail = async (req, res) => {
	try {
		const email = req.params.email
		const donor = await Donor.findByEmail(email)
		if (!donor) {
			return res.status(404).send("Donateur non trouvé")
		}
		res.json(donor)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de la récupération du donateur")
	}
}