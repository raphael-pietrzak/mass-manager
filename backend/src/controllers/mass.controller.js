const Mass = require('../models/mass.model');

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
  try {
    const mass = {
      date: req.body.date,
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      donor_id: req.body.donor_id,
      intention: req.body.intention,
      status: req.body.status,
      deceased: req.body.deceased,
      amount: req.body.amount,
      wants_notification: req.body.wants_notification,
    };

    const massId = await Mass.create(mass);
    const createdMass = await Mass.getById(massId);
    res.status(201).json(createdMass);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de la messe');
  }
};

// Fonctions utilitaires à ajouter
async function getCelebrantIdByName(celebrantName) {
  const celebrant = await db('Celebrants')
    .where('name', celebrantName)
    .first();
  return celebrant ? celebrant.id : null;
}

async function createIntention(description) {
  const [id] = await db('Intentions')
    .insert({ description });
  return id;
}

exports.updateMass = async (req, res) => {
  try {
    const mass = {
      id: req.params.id,
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      donor_id: req.body.donor_id,
      intention: req.body.intention,
      status: req.body.status,
      deceased: req.body.deceased,
      amount: req.body.amount,
      wants_notification: req.body.wants_notification,
    };

    await Mass.update(mass);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de la messe');
  }
};

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

// Les méthodes d'exportation ont été déplacées vers export.controller.js
