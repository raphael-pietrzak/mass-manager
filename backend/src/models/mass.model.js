const db = require('../../config/database'); 

const Mass = {
    getAll: async () => {
        return db('Masses')
            .select(
                'Masses.id',
                'Masses.date',
                'Celebrants.religious_name as celebrant',
                'Masses.intention',
                'Masses.status',
                db.raw("COALESCE(Masses.status, 'basse') as type"),
                db.raw("'Chapelle principale' as location"),
            )
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')

            .orderBy('Masses.date');
    },

    create: async (mass) => {
        return db('Masses').insert(mass);
    },

    getById: async (id) => {
        return db.select().from('Masses').where('id', id);
    },

    update: async (mass) => {
        return db('Masses').where('id', mass.id).update(mass);
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

    findNextAvailableCelebrant: async (targetDate) => {
        const celebrants = await db('Celebrants')
            .where('is_available', true);

        const massCount = await db('Masses')
            .select('celebrant_id')
            .count('* as count')
            .where('date', '>=', db.raw('DATE_SUB(CURDATE(), INTERVAL 30 DAY)'))
            .groupBy('celebrant_id');

        const workload = {};
        massCount.forEach(item => {
            workload[item.celebrant_id] = parseInt(item.count);
        });

        const availableCelebrants = await Promise.all(
            celebrants.map(async (celebrant) => {
                const masses = await Mass.getMassesByCelebrantAndDate(celebrant.id, targetDate);
                return {
                    ...celebrant,
                    currentMasses: masses.count,
                    totalWorkload: workload[celebrant.id] || 0
                };
            })
        );

        const freeCelebrants = availableCelebrants.filter(c => c.currentMasses === 0);
        
        freeCelebrants.sort((a, b) => a.totalWorkload - b.totalWorkload);

        return freeCelebrants[0] || null;
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
            .select('Masses.*', 'Celebrants.religious_name as celebrant_name')
            .orderBy('date');
    },

    getMassesByDateRange: async (startDate, endDate) => {
        let query = db('Masses')
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .select(
                'Masses.id',
                'Masses.date',
                'Celebrants.religious_name as celebrant',
                'Masses.intention',
                'Masses.status',
                db.raw("COALESCE(Masses.status, 'basse') as type"),
                db.raw("'Chapelle principale' as location")
            )
            .orderBy('Masses.date');
        
        if (startDate) {
            // Extraire la partie YYYY-MM-DD de la date ISO
            const formattedStartDate = startDate.substring(0, 10);
            query = query.where(db.raw('DATE(Masses.date)'), '>=', formattedStartDate);
        }
        
        if (endDate) {
            // Extraire la partie YYYY-MM-DD de la date ISO
            const formattedEndDate = endDate.substring(0, 10);
            query = query.where(db.raw('DATE(Masses.date)'), '<=', formattedEndDate);
        }
        
        return query;
    }
};

module.exports = Mass;