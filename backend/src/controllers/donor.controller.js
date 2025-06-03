// donor.controller.js
const Donor = require("../models/donor.model")
const exportDonorService = require("../services/exportDonor.service")

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