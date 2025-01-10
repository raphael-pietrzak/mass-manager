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
    let targetDate = req.body.date;
    let nextCelebrant;

    if (targetDate) {
      nextCelebrant = await Mass.findNextAvailableCelebrant(targetDate);
      if (!nextCelebrant) {
        return res.status(400).json({
          message: 'Aucun célébrant disponible pour cette date'
        });
      }
    } else {
      const nextSlot = await Mass.findNextAvailableSlot();
      if (!nextSlot) {
        return res.status(400).json({
          message: 'Aucun créneau disponible dans les 30 prochains jours'
        });
      }
      targetDate = nextSlot.date;
      nextCelebrant = nextSlot.celebrant;
    }

    const mass = {
      date: targetDate,
      celebrant_id: nextCelebrant.id,
      intention_id: req.body.intention_id,
      status: 'scheduled'
    };

    const massId = await Mass.create(mass);
    res.status(201).json({
      message: 'Messe enregistrée',
      date: targetDate,
      celebrant: nextCelebrant.name
    });
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
