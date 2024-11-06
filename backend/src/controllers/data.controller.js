// controllers/dataController.js
const Donor = require('../models/donor.model');
const Intention = require('../models/intention.model');
const Mass = require('../models/mass.model');
const Celebrant = require('../models/celebrant.model');
const SpecialDay = require('../models/specialDay.model');


exports.getDonors = async (req, res) => {
  try {
    const data = await Donor.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.getDonor = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Donor.getById(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.createDonor = async (req, res) => {
  try {
    const donor = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    const donorId = await Donor.create(donor);
    res.status(201).send('Donateur enregistré');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement du donateur');
  }
};

exports.getIntentions = async (req, res) => {
  try {
    const data = await Intention.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }

};

exports.createIntention = async (req, res) => {
  try {
    // Insertion de l'intention, du donateur et des messes
    const donor = {
      name: req.body.brotherName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    const donorId = await Donor.create(donor);

    const intention = {
      description: req.body.intention,
      amount: req.body.amount,
      donor_id: donorId,
      date_requested: req.body.date
    };

  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de l\'intention');
  }
};

exports.deleteIntention = async (req, res) => {
  try {
    const id = req.params.id;
    await Intention.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de l\'intention');
  }
}

exports.getMasses = async (req, res) => {
  try {
    const data = await Mass.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.getCelebrants = async (req, res) => {
  try {
    const data = await Celebrant.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.getSpecialDays = async (req, res) => {
  try {
    const data = await SpecialDay.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

