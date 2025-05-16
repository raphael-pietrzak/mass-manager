// donor.controller.js
const Donor = require("../models/donor.model")
const exportDonorService = require("../services/exportDonor.service")

exports.getDonors = async (req, res) => {
	try {
		// Récupérer les paramètres de pagination depuis la requête
		const limit = parseInt(req.query.limit) || 10
		const page = parseInt(req.query.page) || 1
		const offset = (page - 1) * limit

		// Récupérer la recherche depuis la requête
		const searchQuery = req.query.searchQuery || null // Paramètre optionnel pour la recherche

		// Si un searchQuery est fourni, on applique la recherche en plus de la pagination
		let donors, totalCount

		if (searchQuery) {
			// Recherche les donateurs qui correspondent à searchQuery
			;[donors, totalCount] = await Promise.all([
				Donor.getBySearch(searchQuery), // Une méthode pour filtrer selon le searchQuery
				Donor.getCountBySearch(searchQuery), // Nombre total de donateurs pour cette recherche
			])
		} else {
			// Pagination classique sans recherche
			;[donors, totalCount] = await Promise.all([
				Donor.getPaginated(limit, offset), // Pagination classique
				Donor.getCount(), // Nombre total de donateurs
			])
		}

		// Calculer le nombre total de pages
		const totalPages = Math.ceil(totalCount / limit)

		if (Object.keys(req.query).length > 0) {
			// si la requete contient des query
			res.json({ donors, totalPages, currentPage: page })
		} else {
			// siono retourner les donateurs et les informations de pagination
			res.json(donors)
			return 
			
		}

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

exports.exportToExcel = async (req, res) => {
	try {
		// Récupérer tous les doneurs
		const donors = await Donor.getAll()

		// Générer le fichier Excel
		const buffer = await exportDonorService.generateExcel(donors)

		// Envoyer le fichier
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		res.setHeader("Content-Disposition", 'attachment; filename="liste des donateurs.xlsx"')
		res.send(buffer)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'exportation vers Excel")
	}
}

exports.exportToPdf = async (req, res) => {
	try {
		// Récupérer tous les doneurs
		const donors = await Donor.getAll()

		// Générer le PDF
		const buffer = await exportDonorService.generatePDF(donors)

		// Envoyer le PDF
		res.setHeader("Content-Type", "application/pdf")
		res.setHeader("Content-Disposition", 'attachment; filename="liste des donateurs.pdf"')
		res.send(buffer)
	} catch (error) {
		console.error(error)
		res.status(500).send("Erreur lors de l'exportation vers PDF")
	}
}
