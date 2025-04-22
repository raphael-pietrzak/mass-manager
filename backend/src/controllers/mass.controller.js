const Mass = require('../models/mass.model');
const Intention = require('../models/intention.model');
const Donor = require('../models/donor.model');
const db = require('../../config/database');

exports.getMasses = async (req, res) => {
  try {
    const data = await Mass.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.getMass = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Mass.getById(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.createMass = async (req, res) => {
  console.log('Création de la messe avec les données suivantes:', req.body);
  try {
    // 1. Créer ou récupérer le donateur
    let donorId = null;

    const donorData = {
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      zip_code: req.body.postalCode
    };

    donorId = await Donor.create(donorData);

    // 2. Créer l'intention
    const intentionData = {
      donor_id: donorId,
      intention_text: req.body.intention,
      type: req.body.type || 'defunts',
      amount: req.body.amount,
      payment_method: req.body.paymentMethod,
      brother_name: req.body.brotherName || '',
      wants_celebration_date: req.body.wantsCelebrationDate || false,
      date_type: req.body.dateType || 'indifferente'
    };

    const intentionId = await Intention.create(intentionData);

    // 3. Créer la messe associée
    const massData = {
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      intention_id: intentionId,
      status: req.body.status || 'pending'
    };

    await Mass.create(massData);

    res.status(201).send('Messe créée avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de la messe');
  }
};

exports.updateMass = async (req, res) => {
  try {
    // Mise à jour de la messe uniquement (pas l'intention)
    const mass = {
      id: req.params.id,
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      intention_id: req.body.intention_id,
      status: req.body.status
    };

    await Mass.update(mass);
    res.status(204).send();
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de la messe');
  }
}
exports.deleteMass = async (req, res) => {
  try {
    const id = req.params.id;
    await Mass.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de la messe');
  }
};
exports.getMassesByIntention = async (req, res) => {
  try {
    const intentionId = req.params.intentionId;
    const data = await Mass.getByIntentionId(intentionId);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des messes par intention');
  }
};

