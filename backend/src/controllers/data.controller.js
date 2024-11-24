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

exports.updateDonor = async (req, res) => {
  try {
    const donor = {
      id: req.params.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    await Donor.update(donor);
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
      celebrant_id: req.body.celebrant_id,
      intention_id: req.body.intention_id
    };

    const massId = await Mass.create(mass);
    res.status(201).send('Messe enregistrée');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de la messe');
  }
};

exports.updateMass = async (req, res) => {
  try {
    const mass = {
      id: req.params.id,
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      intention_id: req.body.intention_id
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


exports.getCelebrants = async (req, res) => {
  try {
    const data = await Celebrant.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.getCelebrant = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Celebrant.getById(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.createCelebrant = async (req, res) => {
  try {
    const celebrant = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    const celebrantId = await Celebrant.create(celebrant);
    res.status(201).send('Célébrant enregistré');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement du célébrant');
  }
}

exports.updateCelebrant = async (req, res) => {
  try {
    const celebrant = {
      id: req.params.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    await Celebrant.update(celebrant);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour du célébrant');
  }
};

exports.deleteCelebrant = async (req, res) => {
  try {
    const id = req.params.id;
    await Celebrant.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression du célébrant');
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


exports.getSpecialDay = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await SpecialDay.getById(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.createSpecialDay = async (req, res) => {
  try {
    const specialDay = {
      date: req.body.date,
      description: req.body.description
    };

    const specialDayId = await SpecialDay.create(specialDay);
    res.status(201).send('Journée spéciale enregistrée');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de la journée spéciale');
  }
};

exports.updateSpecialDay = async (req, res) => {
  try {
    const specialDay = {
      id: req.params.id,
      date: req.body.date,
      description: req.body.description
    };

    await SpecialDay.update(specialDay);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la mise à jour de la journée spéciale');
  }
};

exports.deleteSpecialDay = async (req, res) => {
  try {
    const id = req.params.id;
    await SpecialDay.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de la journée spéciale');
  }
};
