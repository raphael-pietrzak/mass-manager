const db = require('../../config/database');
const Mass = require('../models/mass.model');

const MassService = {
    /**
     * Génère une prévisualisation des messes en fonction des paramètres fournis
     * 
     * @param {Object} params - Paramètres pour la prévisualisation
     * @param {string} params.intention_text - Le texte d'intention
     * @param {boolean} params.deceased - Si l'intention est pour un défunt
     * @param {Array<string>} params.dates - Dates souhaitées pour les messes (facultatif)
     * @param {number} params.mass_count - Nombre de messes à prévoir
     * @param {number} params.celebrant_id - ID du célébrant sélectionné (facultatif)
     * @param {string} params.date_type - Type de date: 'imperative', 'preferred', 'indifferent'
     * @returns {Array} Prévisualisation des messes
     */
    generateMassPreview: async (params) => {
        try {
            const { 
                intention_text, 
                deceased = false,
                dates = [], 
                mass_count = 1, 
                celebrant_id = null,
                date_type = 'indifferent'
            } = params;
            
            const masses = [];
            // Pour suivre les célébrants déjà utilisés par date
            const usedCelebrantsByDate = {};
            
            // Si des dates sont fournies (impératives ou souhaitées)
            if (dates && dates.length > 0 && (date_type === 'imperative' || date_type === 'preferred')) {
                for (let i = 0; i < Math.min(dates.length, mass_count); i++) {
                    const date = dates[i];
                    
                    // Initialiser le tracking pour cette date
                    if (!usedCelebrantsByDate[date]) {
                        usedCelebrantsByDate[date] = new Set();
                    }
                    
                    // CAS 1 & 2: Date impérative
                    if (date_type === 'imperative') {
                        const massData = await MassService.handleImperativeDate(
                            date, celebrant_id, intention_text, deceased, usedCelebrantsByDate
                        );
                        
                        // Si massData est null, c'est un échec (pas de célébrant disponible)
                        if (!massData) {
                            masses.push({
                                date,
                                intention: intention_text,
                                type: deceased ? 'defunts' : 'vivants',
                                celebrant_id: null,
                                celebrant_name: "Aucun célébrant disponible",
                                status: 'error',
                                error: 'no_celebrant_available'
                            });
                        } else {
                            masses.push(massData);
                            // Mettre à jour les célébrants utilisés
                            if (massData.celebrant_id) {
                                usedCelebrantsByDate[date].add(parseInt(massData.celebrant_id));
                            }
                        }
                    } 
                    // CAS 3 & 4: Date souhaitée
                    else if (date_type === 'preferred') {
                        const massData = await MassService.handlePreferredDate(
                            date, celebrant_id, intention_text, deceased, usedCelebrantsByDate
                        );
                        
                        masses.push(massData);
                        // Mettre à jour les célébrants utilisés
                        if (massData.celebrant_id) {
                            const dateToUse = massData.date || date;
                            if (!usedCelebrantsByDate[dateToUse]) {
                                usedCelebrantsByDate[dateToUse] = new Set();
                            }
                            usedCelebrantsByDate[dateToUse].add(parseInt(massData.celebrant_id));
                        }
                    }
                }
            } 
            // CAS 5 & 6: Date indifférente
            else {
                for (let i = 0; i < mass_count; i++) {
                    let massData;
                    
                    // CAS 5: Célébrant spécifique
                    if (celebrant_id) {
                        massData = await MassService.handleIndifferentDateWithCelebrant(
                            celebrant_id, intention_text, deceased, usedCelebrantsByDate
                        );
                    } 
                    // CAS 6: Pas de célébrant spécifique
                    else {
                        massData = await MassService.handleIndifferentDate(
                            intention_text, deceased, usedCelebrantsByDate
                        );
                    }
                    
                    masses.push(massData);
                    // Mettre à jour les célébrants utilisés
                    if (massData.celebrant_id && massData.date) {
                        const dateToUse = massData.date;
                        if (!usedCelebrantsByDate[dateToUse]) {
                            usedCelebrantsByDate[dateToUse] = new Set();
                        }
                        usedCelebrantsByDate[dateToUse].add(parseInt(massData.celebrant_id));
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
     * Gère le cas d'une date impérative
     */
    handleImperativeDate: async (date, celebrant_id, intention_text, deceased, usedCelebrantsByDate) => {
        // Si un célébrant spécifique est sélectionné
        if (celebrant_id) {
            // Vérifier si le célébrant est disponible à cette date précise
            const isAvailable = await Mass.isCelebrantAvailable(celebrant_id, date) && 
                               (!usedCelebrantsByDate[date] || !usedCelebrantsByDate[date].has(parseInt(celebrant_id)));
            
            if (isAvailable) {
                const celebrant = await MassService.getCelebrantById(celebrant_id);
                return {
                    date,
                    intention: intention_text,
                    type: deceased ? 'defunts' : 'vivants',
                    celebrant_id: celebrant.id,
                    celebrant_name: celebrant.religious_name,
                    status: 'pending'
                };
            } else {
                // Échec: célébrant indisponible à cette date
                return null;
            }
        } 
        // Pas de célébrant spécifique (chercher n'importe quel célébrant disponible)
        else {
            // Récupérer les célébrants déjà utilisés à cette date
            const usedCelebrants = usedCelebrantsByDate[date] ? Array.from(usedCelebrantsByDate[date]) : [];
            // Trouver un célébrant disponible à cette date
            const availableCelebrant = await Mass.getRandomAvailableCelebrant(date, usedCelebrants);
            
            if (availableCelebrant) {
                return {
                    date,
                    intention: intention_text,
                    type: deceased ? 'defunts' : 'vivants',
                    celebrant_id: availableCelebrant.id,
                    celebrant_name: availableCelebrant.religious_name,
                    status: 'pending'
                };
            } else {
                // Échec: aucun célébrant disponible à cette date
                return null;
            }
        }
    },
    
    /**
     * Gère le cas d'une date souhaitée
     */
    handlePreferredDate: async (date, celebrant_id, intention_text, deceased, usedCelebrantsByDate) => {
        // Si un célébrant spécifique est sélectionné
        if (celebrant_id) {
            // Vérifier si le célébrant est disponible à cette date
            const isAvailable = await Mass.isCelebrantAvailable(celebrant_id, date) && 
                               (!usedCelebrantsByDate[date] || !usedCelebrantsByDate[date].has(parseInt(celebrant_id)));
            
            if (isAvailable) {
                const celebrant = await MassService.getCelebrantById(celebrant_id);
                return {
                    date,
                    intention: intention_text,
                    type: deceased ? 'defunts' : 'vivants',
                    celebrant_id: celebrant.id,
                    celebrant_name: celebrant.religious_name,
                    status: 'pending'
                };
            } else {
                // Chercher la date disponible la plus proche pour ce célébrant
                const slot = await Mass.findNextAvailableSlotForCelebrant(celebrant_id, usedCelebrantsByDate);
                
                if (slot) {
                    return {
                        original_date: date, // Conserver la date souhaitée initialement
                        date: slot.date.toISOString().split('T')[0],
                        intention: intention_text,
                        type: deceased ? 'defunts' : 'vivants',
                        celebrant_id: slot.celebrant.id,
                        celebrant_name: slot.celebrant.religious_name,
                        status: 'pending',
                        changed_date: true
                    };
                } else {
                    // Aucune date disponible pour ce célébrant
                    return {
                        date: null,
                        intention: intention_text,
                        type: deceased ? 'defunts' : 'vivants',
                        celebrant_id: celebrant_id,
                        celebrant_name: "Aucune disponibilité",
                        status: 'error',
                        error: 'no_availability'
                    };
                }
            }
        } 
        // Pas de célébrant spécifique
        else {
            // Trouver un célébrant disponible à cette date
            const usedCelebrants = usedCelebrantsByDate[date] ? Array.from(usedCelebrantsByDate[date]) : [];
            const availableCelebrant = await Mass.getRandomAvailableCelebrant(date, usedCelebrants);
            
            if (availableCelebrant) {
                return {
                    date,
                    intention: intention_text,
                    type: deceased ? 'defunts' : 'vivants',
                    celebrant_id: availableCelebrant.id,
                    celebrant_name: availableCelebrant.religious_name,
                    status: 'pending'
                };
            } else {
                // Chercher la date la plus proche avec un célébrant disponible
                const slot = await Mass.findNextAvailableSlot(usedCelebrantsByDate);
                
                if (slot) {
                    return {
                        original_date: date, // Conserver la date souhaitée initialement
                        date: slot.date.toISOString().split('T')[0],
                        intention: intention_text,
                        type: deceased ? 'defunts' : 'vivants',
                        celebrant_id: slot.celebrant.id,
                        celebrant_name: slot.celebrant.religious_name,
                        status: 'pending',
                        changed_date: true
                    };
                } else {
                    // Aucune date disponible
                    return {
                        date: null,
                        intention: intention_text,
                        type: deceased ? 'defunts' : 'vivants',
                        celebrant_id: null,
                        celebrant_name: "Aucune disponibilité",
                        status: 'error',
                        error: 'no_availability'
                    };
                }
            }
        }
    },
    
    /**
     * Gère le cas d'une date indifférente avec un célébrant spécifique
     */
    handleIndifferentDateWithCelebrant: async (celebrant_id, intention_text, deceased, usedCelebrantsByDate) => {
        // Chercher la prochaine date disponible pour ce célébrant
        const slot = await Mass.findNextAvailableSlotForCelebrant(celebrant_id, usedCelebrantsByDate);
        
        if (slot) {
            return {
                date: slot.date.toISOString().split('T')[0],
                intention: intention_text,
                type: deceased ? 'defunts' : 'vivants',
                celebrant_id: slot.celebrant.id,
                celebrant_name: slot.celebrant.religious_name,
                status: 'pending'
            };
        } else {
            // Aucune date disponible pour ce célébrant
            return {
                date: null,
                intention: intention_text,
                type: deceased ? 'defunts' : 'vivants',
                celebrant_id: celebrant_id,
                celebrant_name: "Aucune disponibilité",
                status: 'error',
                error: 'no_availability'
            };
        }
    },
    
    /**
     * Gère le cas d'une date indifférente sans célébrant spécifique
     * Cherche la combinaison qui optimise l'équilibre des charges
     */
    handleIndifferentDate: async (intention_text, deceased, usedCelebrantsByDate) => {
        // Chercher le célébrant qui a le moins de messes assignées
        const leastBusyCelebrant = await MassService.getLeastBusyCelebrant();
        
        if (leastBusyCelebrant) {
            // Chercher la prochaine date disponible pour ce célébrant
            const slot = await Mass.findNextAvailableSlotForCelebrant(leastBusyCelebrant.id, usedCelebrantsByDate);
            
            if (slot) {
                return {
                    date: slot.date.toISOString().split('T')[0],
                    intention: intention_text,
                    type: deceased ? 'defunts' : 'vivants',
                    celebrant_id: slot.celebrant.id,
                    celebrant_name: slot.celebrant.religious_name,
                    status: 'pending'
                };
            }
        }
        
        // Si aucun célébrant spécifique n'est trouvé ou disponible, chercher n'importe quelle combinaison disponible
        const slot = await Mass.findNextAvailableSlot(usedCelebrantsByDate);
        
        if (slot) {
            return {
                date: slot.date.toISOString().split('T')[0],
                intention: intention_text,
                type: deceased ? 'defunts' : 'vivants',
                celebrant_id: slot.celebrant.id,
                celebrant_name: slot.celebrant.religious_name,
                status: 'pending'
            };
        } else {
            // Aucune date disponible
            return {
                date: null,
                intention: intention_text,
                type: deceased ? 'defunts' : 'vivants',
                celebrant_id: null,
                celebrant_name: "Aucune disponibilité",
                status: 'error',
                error: 'no_availability'
            };
        }
    },
    
    /**
     * Récupère le célébrant ayant le moins de messes assignées
     */
    getLeastBusyCelebrant: async () => {
        // Sélectionner tous les célébrants avec le nombre de messes assignées
        const celebrantsWithCount = await db.raw(`
            SELECT 
                c.id, 
                c.religious_name, 
                COUNT(m.id) as mass_count
            FROM 
                Celebrants c
            LEFT JOIN 
                Masses m ON c.id = m.celebrant_id
            GROUP BY 
                c.id, c.religious_name
            ORDER BY 
                mass_count ASC
            LIMIT 1
        `);
        
        return celebrantsWithCount.rows && celebrantsWithCount.rows.length > 0 
            ? celebrantsWithCount.rows[0] 
            : null;
    },
        
    /**
     * Récupère les détails d'un célébrant par son ID
     */
    getCelebrantById: async (id) => {
        return db('Celebrants')
            .select('id', 'religious_name', 'title')
            .where('id', id)
            .first();
    }
};

module.exports = MassService;
