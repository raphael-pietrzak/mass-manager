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
    const donor = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      zip_code: req.body.zip_code,
      city: req.body.city,
    };

    const donorId = await Donor.create(donor);
    res.status(201).send(' ✔ Donateur enregistré avec succès !');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement du donateur');
  }
};

exports.updateDonor = async (req, res) => {
  try {
    const donor = {
      id: req.params.id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      zip_code: req.body.zip_code,
      city: req.body.city,
    };

    await Donor.update(donor);
    res.status(201).send('✔ Donateur mis à jour avec succès !');
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

// intention.controller.js
// ...existing code...

// mass.controller.js
// ...existing code...

// celebrant.controller.js
// ...existing code...

// specialDay.controller.js
// ...existing code...
