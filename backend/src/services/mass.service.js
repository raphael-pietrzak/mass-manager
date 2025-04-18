const db = require('../../config/database');
const Mass = require('../models/mass.model');

const MassService = {
    /**
     * Génère une prévisualisation des messes en fonction des paramètres fournis
     * 
     * @param {Object} params - Paramètres pour la prévisualisation
     * @param {string} params.intention - Le texte d'intention
     * @param {string} params.type - Le type d'intention (défunts/vivants)
     * @param {number} params.amount - Le montant du don
     * @param {boolean} params.wantsCelebrationDate - Si le donateur souhaite être notifié de la date
     * @param {Array<string>} params.dates - Dates souhaitées pour les messes (facultatif)
     * @param {number} params.massCount - Nombre de messes à prévoir
     * @returns {Object} Prévisualisation avec masses, montant total et nombre
     */
    generateMassPreview: async (params) => {
        try {
            const { intention, type, amount, wantsCelebrationDate, dates, massCount = 1 } = params;
            
            const totalAmount = parseFloat(amount || 0) * massCount;
            const masses = [];
            
            // Si des dates spécifiques sont fournies, utiliser ces dates
            if (dates && dates.length > 0) {
                for (let i = 0; i < Math.min(dates.length, massCount); i++) {
                    const date = dates[i];
                    // Trouver un célébrant disponible pour cette date
                    const celebrant = await Mass.getRandomAvailableCelebrant(date);
                    
                    masses.push({
                        date,
                        intention,
                        type,
                        celebrant_id: celebrant ? celebrant.id : null,
                        celebrant_name: celebrant ? celebrant.religious_name : "À déterminer",
                        status: 'pending'
                    });
                }
            } else {
                // Sinon, chercher des créneaux disponibles
                for (let i = 0; i < massCount; i++) {
                    // Trouver un créneau disponible à partir de la date actuelle
                    const slot = await Mass.findNextAvailableSlot();
                    
                    if (slot) {
                        masses.push({
                            date: slot.date.toISOString().split('T')[0], // Format YYYY-MM-DD
                            intention,
                            type,
                            celebrant_id: slot.celebrant.id,
                            celebrant_name: slot.celebrant.religious_name,
                            status: 'pending'
                        });
                    } else {
                        // Pas de créneau disponible, ajouter une messe sans date ni célébrant
                        masses.push({
                            date: null,
                            intention,
                            type,
                            celebrant_id: null,
                            celebrant_name: "À déterminer",
                            status: 'pending'
                        });
                    }
                }
            }
            
            return {
                masses,
                totalAmount: totalAmount.toFixed(2),
                massCount
            };
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
