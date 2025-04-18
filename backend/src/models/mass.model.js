const db = require('../../config/database'); 

const Mass = {
    getAll: async () => {
        const results = await db('Masses')
            .select(
                'Masses.id',
                'Masses.date',
                'Celebrants.religious_name as celebrant',
                'Intentions.intention_text as intention',
                'Masses.status',
                'Intentions.type',
                'Intentions.amount',
                'Intentions.wants_celebration_date as wants_notification',
                'Intentions.donor_id',
                'Donors.firstname as donor_firstname',
                'Donors.lastname as donor_lastname',

            )
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .leftJoin('Intentions', 'Masses.intention_id', 'Intentions.id')
            .leftJoin('Donors', 'Intentions.donor_id', 'Donors.id')
            .orderBy('Masses.date');
    
        return results
    },
    

    create: async (mass) => {
        return db('Masses').insert(mass);
    },

    getById: async (id) => {
        return db('Masses')
            .select(
                'Masses.id',
                'Masses.date',
                'Masses.celebrant_id',
                'Celebrants.religious_name as celebrant',
                'Masses.status',
                'Masses.intention_id',
                'Intentions.intention_text as intention',
                'Intentions.type',
                'Intentions.amount',
                'Intentions.wants_celebration_date as wants_notification',
                'Intentions.donor_id'
            )
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .leftJoin('Intentions', 'Masses.intention_id', 'Intentions.id')
            .where('Masses.id', id)
            .first();
    },

    update: async (mass) => {
        return db('Masses')
            .where('id', mass.id)
            .update({
                date: mass.date,
                celebrant_id: mass.celebrant_id,
                intention_id: mass.intention_id,
                status: mass.status
            });
    },

    delete: async (id) => {
        return db('Masses').where('id', id).del();
    },

    getMassesByCelebrantAndDate: async (celebrantId, date) => {
        return db('Masses')
            .where('celebrant_id', celebrantId)
            .whereRaw('DATE(date) = DATE(?)', [date])
            .count('* as count')
            .first();
    },

    getRandomAvailableCelebrant: async (targetDate) => {
        // Formater la date pour la requête SQL
        const formattedDate = new Date(targetDate).toISOString().split('T')[0];
        
        // Récupérer les IDs des célébrants déjà programmés pour cette date
        const busyCelebrants = await db('Masses')
            .where(db.raw('DATE(date) = DATE(?)', [formattedDate]))
            .pluck('celebrant_id');
            
        // Récupérer tous les célébrants disponibles (ceux qui ne sont pas déjà programmés)
        const availableCelebrants = await db('Celebrants')
            .whereNotIn('id', busyCelebrants)
            .select('id', 'religious_name');
            
        // Vérifier s'il y a des célébrants disponibles
        if (availableCelebrants.length === 0) {
            return null;
        }
        
        // Choisir un célébrant aléatoirement parmi ceux disponibles
        const randomIndex = Math.floor(Math.random() * availableCelebrants.length);
        return availableCelebrants[randomIndex];
    },

    findNextAvailableCelebrant: async (targetDate) => {
        // Appel de la méthode getRandomAvailableCelebrant
        return await Mass.getRandomAvailableCelebrant(targetDate);
    },

    findNextAvailableSlot: async () => {
        // Commencer à partir du lendemain
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Chercher sur les 30 prochains jours maximum
        for (let i = 0; i < 30; i++) {
            const dateToCheck = new Date(currentDate);
            dateToCheck.setDate(currentDate.getDate() + i);
            
            // Vérifier si c'est un jour spécial
            const specialDay = await db('SpecialDays')
                .where(db.raw('DATE(date) = DATE(?)', [dateToCheck]))
                .first();
                
            if (specialDay) {
                continue; // Passer au jour suivant si c'est un jour spécial
            }

            // Trouver un célébrant disponible pour cette date
            const availableCelebrant = await Mass.findNextAvailableCelebrant(dateToCheck);
            
            if (availableCelebrant) {
                return {
                    date: dateToCheck,
                    celebrant: availableCelebrant
                };
            }
        }
        
        return null; // Aucun créneau trouvé dans les 30 prochains jours
    },

    getUpcomingMonth: async () => {
        // Nouvelle méthode pour récupérer les intentions du mois à venir
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        return await db('Masses')
            .whereBetween('date', [startDate.toISOString(), endDate.toISOString()])
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .leftJoin('Intentions', 'Masses.intention_id', 'Intentions.id')
            .select(
                'Masses.*',
                'Celebrants.religious_name as celebrant_name',
                'Intentions.intention_text as intention',
                'Intentions.type',
                'Intentions.amount',
                'Intentions.wants_celebration_date as wants_notification',
                'Intentions.donor_id'
            )
            .orderBy('date');
    },

    getMassesByDateRange: async (startDate, endDate) => {
        let query = db('Masses')
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .leftJoin('Intentions', 'Masses.intention_id', 'Intentions.id')
            .select(
                'Masses.id',
                'Masses.date',
                'Celebrants.religious_name as celebrant',
                'Intentions.intention_text as intention',
                'Masses.status',
                'Intentions.type',
                db.raw("'Chapelle principale' as location")
            )
            .orderBy('Masses.date');
        
        if (startDate) {
            // Extraire la partie YYYY-MM-DD de la date ISO
            const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
            query = query.where(db.raw('DATE(Masses.date)'), '>=', formattedStartDate);
        }
        
        if (endDate) {
            // Extraire la partie YYYY-MM-DD de la date ISO
            const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
            query = query.where(db.raw('DATE(Masses.date)'), '<=', formattedEndDate);
        }
        
        return query;
    }
};

module.exports = Mass;