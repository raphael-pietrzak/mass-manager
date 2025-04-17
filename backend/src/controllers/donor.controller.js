// donor.controller.js
const Donor = require('../models/donor.model');

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
    const donorData = {
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      zip_code: req.body.zip_code
    };

    await Donor.create(donorData);
    res.status(201).send('Donateur enregistré');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement du donateur');
  }
};

exports.updateDonor = async (req, res) => {
  try {
    const donorData = {
      id: req.params.id,
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      zip_code: req.body.zip_code
    };

    await Donor.update(donorData);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour du donateur');
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    const id = req.params.id;
    await Donor.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression du donateur');
  }
};