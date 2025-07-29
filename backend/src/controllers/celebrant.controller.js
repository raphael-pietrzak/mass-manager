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
    const id = req.params.id;
    await Celebrant.delete(id);
    res.status(201).send("Célébrant supprimé ! ");
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression du célébrant');
  }
};

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

exports.getFullDates = async (req, res) => {
	try {
		const dates = await Celebrant.getFullDates()
		res.json(dates)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Erreur lors de la récupération des dates d'indisponibilité" })
	}
}
