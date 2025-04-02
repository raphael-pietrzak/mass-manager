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

exports.getAvailableCelebrants = async (req, res) => {
  console.log('getAvailableCelebrants');
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'La date est requise' });
    }
    
    const data = await Celebrant.getAvailableByDate(date);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des célébrants disponibles' });
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
      religious_name: req.body.religious_name,
      civil_first_name: req.body.civil_first_name,
      civil_last_name: req.body.civil_last_name,
      title: req.body.title,
      role: req.body.role
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
      religious_name: req.body.religious_name,
      civil_first_name: req.body.civil_first_name,
      civil_last_name: req.body.civil_last_name,
      title: req.body.title,
      role: req.body.role
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
