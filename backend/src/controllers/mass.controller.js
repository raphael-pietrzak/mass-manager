const Mass = require('../models/mass.model');
const Intention = require('../models/intention.model');
const Donor = require('../models/donor.model');
const db = require('../../config/database');
const MassService = require('../services/mass.service');

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
  console.log('Création de la messe avec les données suivantes:', req.body);
  try {
    // Vérifie si on a un format de prévisualisation ou format classique
    if (req.body.preview && req.body.donor && req.body.payment) {
      // Format de prévisualisation
      const { preview, donor, payment } = req.body;
      
      // 1. Créer le donateur
      const donorData = {
        firstname: donor.firstName,
        lastname: donor.lastName,
        email: donor.email,
        phone: donor.phone || '',
        address: donor.address || '',
        city: donor.city || '',
        zip_code: donor.postalCode || ''
      };
      
      const donorId = await Donor.create(donorData);
      
      // 2. Créer les messes une par une en se basant sur le résultat de la prévisualisation
      for (const massPreview of preview.masses) {
        // 2a. Créer l'intention pour chaque messe
        const intentionData = {
          donor_id: donorId,
          intention_text: massPreview.intention,
          type: massPreview.type || 'defunts',
          amount: payment.amount,
          payment_method: payment.paymentMethod,
          brother_name: payment.brotherName || '',
          wants_celebration_date: donor.wantsCelebrationDate || false,
          date_type: req.body.dateType || 'indifferente'
        };
        
        const intentionId = await Intention.create(intentionData);
        
        // 2b. Créer la messe associée à l'intention
        const massData = {
          date: massPreview.date, // Peut être null
          celebrant_id: massPreview.celebrant_id, // Peut être null
          intention_id: intentionId,
          status: massPreview.status || 'pending'
        };
        
        await Mass.create(massData);
      }
      
      res.status(201).json({ 
        message: 'Messes créées avec succès', 
        count: preview.masses.length 
      });
    } else {
      // Format classique (code existant pour une messe unique)
      // 1. Créer ou récupérer le donateur
      let donorId = null;
      
      const donorData = {
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        zip_code: req.body.postalCode
      };

      donorId = await Donor.create(donorData);
      
      // 2. Créer l'intention
      const intentionData = {
        donor_id: donorId,
        intention_text: req.body.intention,
        type: req.body.type || 'defunts',
        amount: req.body.amount,
        payment_method: req.body.paymentMethod,
        brother_name: req.body.brotherName || '',
        wants_celebration_date: req.body.wantsCelebrationDate || false,
        date_type: req.body.dateType || 'indifferente'
      };

      const intentionId = await Intention.create(intentionData);
      
      // 3. Créer la messe associée
      const massData = {
        date: req.body.date,
        celebrant_id: req.body.celebrant_id,
        intention_id: intentionId,
        status: req.body.status || 'pending'
      };

      await Mass.create(massData);
      
      res.status(201).send('Messe créée avec succès');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de la messe');
  }
};

exports.updateMass = async (req, res) => {
  try {
    // Mise à jour de la messe uniquement (pas l'intention)
    const mass = {
      id: req.params.id,
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      intention_id: req.body.intention_id,
      status: req.body.status
    };

    await Mass.update(mass);
    
    // Si des données d'intention sont fournies, mettre à jour l'intention également
    if (req.body.intention_data) {
      await Intention.update(req.body.intention_data.id, req.body.intention_data);
    }
    
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

/**
 * Prévisualiser ce qui sera créé sans enregistrer en base de données
 */
exports.previewMass = async (req, res) => {
    try {
        const massParams = req.body;
        
        // Utiliser le service pour générer la prévisualisation
        const preview = await MassService.generateMassPreview(massParams);
        
        res.status(200).json(preview);
    } catch (error) {
        console.error('Erreur lors de la prévisualisation de la messe:', error);
        res.status(500).json({ message: 'Erreur lors de la prévisualisation de la messe' });
  }
};
