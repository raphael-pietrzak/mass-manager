// donor.controller.js
const Donor = require("../models/donor.model")

exports.getDonors = async (req, res) => {
	try {
		// Récupérer les paramètres de pagination depuis la requête
		const limit = parseInt(req.query.limit) || 10
		const page = parseInt(req.query.page) || 1
		const offset = (page - 1) * limit

		// Récupérer les donateurs avec pagination
		const [donors, totalCount] = await Promise.all([
			Donor.getPaginated(limit, offset), // La méthode getPaginated est utilisée pour retourner les donateurs paginés
			Donor.getCount(), // Récupérer le nombre total de donateurs
		])

		// Calculer le nombre total de pages
		const totalPages = Math.ceil(totalCount / limit)

		// Retourner les donateurs et les informations de pagination
		res.json({ donors, totalPages, currentPage: page })
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
