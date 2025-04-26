const db = require('../../config/database');
const Mass = require('../models/mass.model');

const MassService = {
    /**
     * Génère une prévisualisation des messes en fonction des paramètres fournis
     * 
     * @param {Object} params - Paramètres pour la prévisualisation
     * @param {string} params.intention_text - Le texte d'intention
     * @param {boolean} params.wants_celebration_date - Si le donateur souhaite être notifié de la date
     * @param {Array<string>} params.dates - Dates souhaitées pour les messes (facultatif)
     * @param {number} params.mass_count - Nombre de messes à prévoir
     * @param {number} params.celebrant_id - ID du célébrant sélectionné (facultatif)
     * @returns {Object} Prévisualisation avec masses
     */
    generateMassPreview: async (params) => {
        try {
            const { intention_text, dates, mass_count = 1, celebrant_id } = params;
            const masses = [];
            
            // Si des dates spécifiques sont fournies, utiliser ces dates
            if (dates && dates.length > 0) {
                for (let i = 0; i < Math.min(dates.length, mass_count); i++) {
                    const date = dates[i];
                    let celebrant = null;
                    let alternativeCelebrant = null;
                    let celebrantAvailable = true;
                    
                    // Si un célébrant spécifique est sélectionné
                    if (celebrant_id) {
                        // Vérifier si le célébrant sélectionné est disponible à cette date
                        celebrantAvailable = await Mass.isCelebrantAvailable(celebrant_id, date);
                        
                        if (celebrantAvailable) {
                            // Récupérer les infos du célébrant sélectionné
                            celebrant = await MassService.getCelebrantById(celebrant_id);
                        } else {
                            // Trouver un autre célébrant disponible pour cette date
                            alternativeCelebrant = await Mass.getRandomAvailableCelebrant(date);
                            // Récupérer quand même les infos du célébrant sélectionné pour le retourner
                            celebrant = await MassService.getCelebrantById(celebrant_id);
                        }
                    } else {
                        // Aucun célébrant spécifique demandé, chercher un disponible
                        celebrant = await Mass.getRandomAvailableCelebrant(date);
                    }
                    
                    // Préparation des données pour la réponse
                    const massData = {
                        date,
                        intention: intention_text,
                        celebrant_id: celebrant ? celebrant.id : null,
                        celebrant_name: celebrant ? celebrant.religious_name : "À déterminer",
                        status: 'pending'
                    };
                    
                    // Si le célébrant sélectionné n'est pas disponible
                    if (celebrant_id && !celebrantAvailable) {
                        massData.celebrant_available = false;
                        // Proposer un autre célébrant si possible
                        if (alternativeCelebrant) {
                            massData.alternative_celebrant_id = alternativeCelebrant.id;
                            massData.alternative_celebrant_name = alternativeCelebrant.religious_name;
                        }
                    }
                    
                    masses.push(massData);
                }
            } else {
                // Recherche de créneaux disponibles
                for (let i = 0; i < mass_count; i++) {
                    let slot = null;
                    
                    // Si un célébrant spécifique est sélectionné
                    if (celebrant_id) {
                        // Trouver le prochain créneau disponible pour ce célébrant
                        slot = await Mass.findNextAvailableSlotForCelebrant(celebrant_id);
                        
                        if (!slot) {
                            // Si pas de créneau disponible pour le célébrant sélectionné,
                            // chercher un créneau avec n'importe quel célébrant
                            const alternativeSlot = await Mass.findNextAvailableSlot();
                            const celebrant = await MassService.getCelebrantById(celebrant_id);
                            
                            masses.push({
                                date: alternativeSlot ? alternativeSlot.date.toISOString().split('T')[0] : null,
                                intention: intention_text,
                                celebrant_id: celebrant ? celebrant.id : null,
                                celebrant_name: celebrant ? celebrant.religious_name : "À déterminer",
                                celebrant_available: false,
                                alternative_celebrant_id: alternativeSlot?.celebrant?.id || null,
                                alternative_celebrant_name: alternativeSlot?.celebrant?.religious_name || "À déterminer",
                                status: 'pending'
                            });
                            
                            continue;
                        }
                    } else {
                        // Trouver un créneau disponible à partir de la date actuelle
                        slot = await Mass.findNextAvailableSlot();
                    }
                    
                    if (slot) {
                        masses.push({
                            date: slot.date.toISOString().split('T')[0], // Format YYYY-MM-DD
                            intention: intention_text,
                            celebrant_id: slot.celebrant.id,
                            celebrant_name: slot.celebrant.religious_name,
                            status: 'pending'
                        });
                    } else {
                        // Pas de créneau disponible, ajouter une messe sans date ni célébrant
                        masses.push({
                            date: null,
                            intention: intention_text,
                            celebrant_id: null,
                            celebrant_name: "À déterminer",
                            status: 'pending'
                        });
                    }
                }
            }
            
            return masses;
        } catch (error) {
            console.error('Erreur lors de la génération de prévisualisation de messes:', error);
            throw error;
        }
    },
        
    /**
     * Récupère les détails d'un célébrant par son ID
     * 
     * @param {number} id - ID du célébrant
     * @returns {Object} Les détails du célébrant
     */
    getCelebrantById: async (id) => {
        return db('Celebrants')
            .select('id', 'religious_name', 'title')
            .where('id', id)
            .first();
    }
};

module.exports = MassService;
