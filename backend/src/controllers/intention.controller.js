const Intention = require('../models/intention.model');
const Donor = require('../models/donor.model');
const db = require('../../config/database');

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
    const data = await Intention.findById(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};

exports.createIntention = async (req, res) => {
  try {
      // Créer ou récupérer le donateur
      let donorId = null;
    
      const donorData = {
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        zip_code: req.body.zip_code
      };
    
      donorId = await Donor.create(donorData);


      // Créer l'intention
      const intention = {
        donor_id: donorId,
        intention_text: req.body.intention_text,
        type: req.body.type || 'defunts',
        amount: req.body.amount,
        payment_method: req.body.payment_method,
        brother_name: req.body.brother_name,
        wants_celebration_date: req.body.wants_celebration_date || false,
        date_type: req.body.date_type || 'indifferente',
        
        // Propriétés de récurrence
        is_recurrent: req.body.is_recurrent || false,
        recurrence_type: req.body.recurrence_type,
        occurrences: req.body.occurrences,
        start_date: req.body.start_date,
        end_type: req.body.end_type,
        end_date: req.body.end_date
      };
      
      // Utiliser le modèle Intention avec la transaction
      await Intention.create(intention);

    res.status(201).send('Intention enregistrée');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de l\'intention');
  }
};

exports.updateIntention = async (req, res) => {
  try {
    const id = req.params.id;
    const intentionData = {
      intention_text: req.body.intention_text,
      type: req.body.type,
      amount: req.body.amount,
      payment_method: req.body.payment_method,
      brother_name: req.body.brother_name,
      wants_celebration_date: req.body.wants_celebration_date,
      date_type: req.body.date_type,
      is_recurrent: req.body.is_recurrent,
      recurrence_type: req.body.recurrence_type,
      occurrences: req.body.occurrences,
      start_date: req.body.start_date,
      end_type: req.body.end_type,
      end_date: req.body.end_date
    };

    await Intention.update(id, intentionData);
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

exports.getPendingIntentions = async (req, res) => {
  try {
    const data = await Intention.getPendingIntentions();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des intentions en attente');
  }
};
