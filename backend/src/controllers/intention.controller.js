const Intention = require('../models/intention.model');
const Donor = require('../models/donor.model');

exports.getIntentions = async (req, res) => {
  try {
    const data = await Intention.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.getIntention = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Intention.getById(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.createIntention = async (req, res) => {
  try {
    // Insertion de l'intention et du donateur
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

    // ...ici vous pouvez ajouter l'insertion des messes si nécessaire...
    res.status(201).send('Intention enregistrée');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de l\'intention');
  }
};

exports.updateIntention = async (req, res) => {
  try {
    const intention = {
      id: req.params.id,
      description: req.body.description,
      amount: req.body.amount,
      donor_id: req.body.donor_id,
      date_requested: req.body.date_requested
    };

    await Intention.update(intention);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de l\'intention');
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
};
