const SpecialDay = require('../models/specialDay.model');

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
      note: req.body.note,
      number_of_masses: req.body.number_of_masses,
      is_recurrent: req.body.is_recurrent,
    };

    await SpecialDay.create(specialDay);
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
      note: req.body.note,
      number_of_masses: req.body.number_of_masses,
      is_recurrent: req.body.is_recurrent,
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
