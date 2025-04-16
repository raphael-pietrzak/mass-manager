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


  // Data example : 
  // {
  //   id: '',
  //   date: '2025-04-16',
  //   celebrant: 3,
  //   type: 'vivants',
  //   intention: 'mon intention',
  //   firstName: 'Bob',
  //   lastName: 'Steve',
  //   email: 'exemple@email.com',
  //   phone: '123456789',
  //   address: '123 rue du lilas',
  //   postalCode: '34000',
  //   city: 'Montpellier',
  //   wantsCelebrationDate: false,
  //   amount: '30',
  //   paymentMethod: 'cash',
  //   brotherName: 'Basile',
  //   massCount: 1,
  //   massType: 'unite',
  //   dateType: 'indifferente',
  //   isRecurrent: true,
  //   recurrenceType: 'daily',
  //   occurrences: 3,
  //   startDate: '2025-04-02',
  //   endType: 'occurrences'
  // }

  try {
    const mass = {
      date: req.body.date,
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      intention: req.body.intention,
      status: req.body.status,
      deceased: req.body.deceased,
      amount: req.body.amount,
      wants_notification: req.body.wants_notification,
    };

    const massId = await Mass.create(mass);
    const createdMass = await Mass.getById(massId);
    res.status(201).json(createdMass);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'enregistrement de la messe');
  }
};

// Fonctions utilitaires à ajouter
async function getCelebrantIdByName(celebrantName) {
  const celebrant = await db('Celebrants')
    .where('name', celebrantName)
    .first();
  return celebrant ? celebrant.id : null;
}

async function createIntention(description) {
  const [id] = await db('Intentions')
    .insert({ description });
  return id;
}

exports.updateMass = async (req, res) => {
  try {
    const mass = {
      id: req.params.id,
      date: req.body.date,
      celebrant_id: req.body.celebrant_id,
      intention: req.body.intention,
      status: req.body.status,
      deceased: req.body.deceased,
      amount: req.body.amount,
      wants_notification: req.body.wants_notification,
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
