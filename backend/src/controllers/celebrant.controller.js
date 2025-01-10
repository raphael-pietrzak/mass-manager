const Celebrant = require('../models/celebrant.model');

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
};

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
