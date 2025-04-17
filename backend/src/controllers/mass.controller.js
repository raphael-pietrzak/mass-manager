const Mass = require('../models/mass.model');
const Intention = require('../models/intention.model');
const Donor = require('../models/donor.model');
const db = require('../../config/database');

exports.getMasses = async (req, res) => {
  try {
    const data = await Mass.getAll();
    console.log('Données des messes récupérées:', data);
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
  // Data example structure mise à jour pour correspondre à la nouvelle structure
  // {
  //   id: '',
  //   date: '2025-04-17',
  //   celebrant: 'unassigned',
  //   type: 'defunts',
  //   intention: 'dfdfd',
  //   firstName: 'fdf',
  //   lastName: 'fdfd',
  //   email: 'dfdf',
  //   phone: 'dfdf',
  //   address: 'dfdf',
  //   postalCode: 'fdfdf',
  //   city: 'fddf',
  //   wantsCelebrationDate: false,
  //   amount: '20',
  //   paymentMethod: 'card',
  //   brotherName: '',
  //   massCount: 1,
  //   massType: 'unite',
  //   dateType: 'indifferente',
  //   isRecurrent: false,
  //   recurrenceType: 'weekly',
  //   occurrences: 1,
  //   endType: 'occurrences'
  // }

  console.log('Création de la messe avec les données suivantes:', req.body);
  try {
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
      brother_name: req.body.brotherName,
      wants_celebration_date: req.body.wantsCelebrationDate || false,
      date_type: req.body.dateType || 'indifferente',
      
      // Récurrence
      is_recurrent: req.body.isRecurrent || false,
      recurrence_type: req.body.recurrenceType,
      occurrences: req.body.occurrences,
      start_date: req.body.startDate || req.body.date,
      end_type: req.body.endType,
      end_date: req.body.endDate
    };
    
    const intentionId = await Intention.create(intentionData);
    
    // 3. Créer la messe associée
    let celebrant_id = null;
    
    // Si le célébrant est non-assigné ou non spécifié, trouver un célébrant disponible automatiquement
    if (!req.body.celebrant || req.body.celebrant === 'unassigned') {
      const availableCelebrant = await Mass.findNextAvailableCelebrant(req.body.date);
      if (availableCelebrant) {
        celebrant_id = availableCelebrant.id;
        console.log(`Célébrant attribué automatiquement: ${availableCelebrant.religious_name} (ID: ${celebrant_id})`);
      }
    } else {
      celebrant_id = req.body.celebrant;
    }
    
    const massData = {
      date: req.body.date,
      celebrant_id: celebrant_id,
      intention_id: intentionId,
      status: 'pending'
    };

    const massId = await Mass.create(massData);
    
    res.status(201).send('Messe créée avec succès');
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
    const massData = req.body;
    const result = await generateMassPreview(massData);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la prévisualisation:', error);
    res.status(500).send('Erreur lors de la prévisualisation des messes');
  }
};

/**
 * Génère une prévisualisation des messes qui seraient créées
 * basée sur les données fournies et les règles de récurrence
 */
async function generateMassPreview(massData) {
  // Tableau pour stocker les messes générées
  const generatedMasses = [];
  
  // Informations de base communes à toutes les messes
  const baseMass = {
    intention: massData.intention || '',
    type: massData.type || 'defunts',
    celebrant: massData.celebrant || 'unassigned'
  };
  
  // Calcul du nombre total de messes à générer
  const massCount = massData.massCount || 1;
  
  // Calcul du montant total
  const amountPerMass = parseFloat(massData.amount || 20);
  const totalAmount = (amountPerMass * massCount).toFixed(2);
  
  if (massData.isRecurrent && massData.startDate) {
    // Cas d'une intention récurrente
    const startDate = new Date(massData.startDate);
    let occurrences = massData.occurrences || 1;
    
    // Déterminer le nombre d'occurrences en fonction du type de fin
    if (massData.endType === 'date' && massData.endDate) {
      const endDate = new Date(massData.endDate);
      // Calculer approximativement le nombre d'occurrences
      switch (massData.recurrenceType) {
        case 'daily':
          occurrences = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
          break;
        case 'weekly':
          occurrences = Math.floor((endDate - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
          break;
        case 'monthly':
          // Approximation simple des mois
          occurrences = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth()) + 1;
          break;
        default:
          occurrences = 1;
      }
    }
    
    // Générer les dates selon le type de récurrence
    for (let i = 0; i < Math.min(occurrences, 50); i++) { // Limite à 50 pour éviter les abus
      const currentDate = new Date(startDate);
      
      switch (massData.recurrenceType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + i);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (i * 7));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + i);
          break;
        default:
          break;
      }
      
      // Ajouter la messe générée à la liste
      generatedMasses.push({
        ...baseMass,
        date: currentDate.toISOString().split('T')[0],
        id: `preview-${i + 1}` // ID temporaire pour l'affichage
      });
    }
  } else {
    // Cas d'une intention unique ou multiple sans récurrence
    const baseDate = massData.date ? new Date(massData.date) : new Date();
    
    for (let i = 0; i < massCount; i++) {
      const currentDate = new Date(baseDate);
      
      if (massData.dateType === 'indifferente' && i > 0) {
        // Répartir les messes sur plusieurs jours si la date est indifférente
        currentDate.setDate(currentDate.getDate() + i);
      }
      
      generatedMasses.push({
        ...baseMass,
        date: currentDate.toISOString().split('T')[0],
        id: `preview-${i + 1}` // ID temporaire pour l'affichage
      });
    }
  }
  
  // Retourner le résultat de la prévisualisation
  return {
    masses: generatedMasses,
    massCount: generatedMasses.length,
    totalAmount: totalAmount
  };
}

// Les méthodes d'exportation ont été déplacées vers export.controller.js
