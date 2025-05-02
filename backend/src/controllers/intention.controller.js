const Intention = require('../models/intention.model');
const Donor = require('../models/donor.model');
const db = require('../../config/database');
const MassService = require('../services/mass.service');
const MassModel = require('../models/mass.model');

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
    const intentionData = req.body;
    let donorId;
    
    // Préparer les données du donateur
    const donorData = {
      firstname: intentionData.donor.first_name,
      lastname: intentionData.donor.last_name,
      email: intentionData.donor.email || null,
      phone: intentionData.donor.phone || null,
      address: intentionData.donor.address || null,
      zip_code: intentionData.donor.postal_code || null,
      city: intentionData.donor.city || null
    };

    // Vérifier si le donateur existe déjà
    const existingDonor = await Donor.findByEmail(intentionData.donor.email);
    if (existingDonor) {
      donorId = existingDonor.id;
    } else {
      // Si le donateur n'existe pas, le créer
      donorId = await Donor.create(donorData);
    }

    // Créer l'intention
    const intention = {
      donor_id: donorId,
      intention_text: intentionData.masses[0]?.intention || "Intention de messe",
      deceased: intentionData.deceased || false,
      amount: parseFloat(intentionData.payment.amount),
      payment_method: intentionData.payment.payment_method,
      brother_name: intentionData.payment.brother_name || null,
      wants_celebration_date: intentionData.donor.wants_celebration_date,
      date_type: intentionData.donor.wants_celebration_date ? 'specifique' : 'indifferente'
    };
    
    const intentionId = await Intention.create(intention);
    
    // Traiter les messes associées
    if (intentionData.masses && intentionData.masses.length > 0) {
      // Map pour suivre les célébrants déjà assignés par date
      const assignedCelebrantsByDate = new Map();
      
      for (const mass of intentionData.masses) {
        const massDate = mass.date;
        const celebrantId = mass.celebrant_id;
        
        // Vérifier si un célébrant est déjà assigné pour cette date
        if (celebrantId && massDate) {
          const dateKey = new Date(massDate).toISOString().split('T')[0];
          
          // Si un célébrant est déjà assigné pour cette date et que c'est le même
          if (assignedCelebrantsByDate.has(dateKey) && 
              assignedCelebrantsByDate.get(dateKey) === celebrantId) {
            // Ne pas permettre la création de cette messe avec ce célébrant
            continue;
          }
          
          // Vérifier également si ce célébrant n'est pas déjà assigné à une autre messe ce jour-là
          const isCelebrantAvailable = await MassModel.isCelebrantAvailable(celebrantId, dateKey);
          if (!isCelebrantAvailable) {
            // Le célébrant est déjà assigné à une autre messe ce jour-là
            // On pourrait soit sauter cette messe, soit lui assigner un autre célébrant
            // Dans cet exemple, on continue sans assigner de célébrant
            mass.celebrant_id = null;
          } else {
            // Marquer ce célébrant comme assigné pour cette date
            assignedCelebrantsByDate.set(dateKey, celebrantId);
          }
        }
        
        const massData = {
          date: mass.date,
          intention_id: intentionId,
          celebrant_id: mass.celebrant_id || null,
          status: 'pending'
        };
        
        await MassModel.create(massData);
      }
    }
    
    // Récupérer les données complètes pour la réponse
    const result = await Intention.findById(intentionId);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur lors de la création de l\'intention:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'intention' });
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

exports.previewIntention = async (req, res) => {
  try {
    const preview = await MassService.generateMassPreview({
      celebrant_id: req.body.celebrant_id,
      intention_text: req.body.intention_text,
      deceased: req.body.deceased,
      dates: req.body.dates,
      mass_count: req.body.mass_count,
      date_type: req.body.date_type,
      is_recurrent: req.body.is_recurrent,
      recurrence_type: req.body.recurrence_type,
      occurrences: req.body.occurrences,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      end_type: req.body.end_type
    });
    res.status(200).json(preview);
  } catch (error) {
    console.error('Erreur lors de la prévisualisation de l\'intention:', error);
    res.status(500).json({ message: 'Erreur lors de la prévisualisation de l\'intention' });
  }
};

exports.getIntentionMasses = async (req, res) => {
  try {
    const intentionId = req.params.id;
    const masses = await MassModel.getMassesByIntentionId(intentionId);
    
    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedMasses = masses.map(mass => ({
      date: mass.date ? new Date(mass.date).toISOString().split('T')[0] : null,
      intention: mass.intention || '',
      type: mass.deceased ? 'defunts' : 'vivants',
      celebrant_id: mass.celebrant_id || null,
      celebrant_name: mass.celebrant_name || '',
      status: mass.status || 'pending'
    }));
    
    res.json(formattedMasses);
  } catch (error) {
    console.error('Erreur lors de la récupération des messes associées:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messes associées' });
  }
};
