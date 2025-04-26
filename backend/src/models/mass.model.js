const db = require('../../config/database');

class Mass {
    static async getAll() {
        const results = await db('Masses')
            .select(
                'Masses.id',
                'Masses.date',
                'Celebrants.religious_name as celebrant',
                'Intentions.intention_text as intention',
                'Masses.status',
                'Intentions.deceased',
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
    
        return results;
    }

    static async create(mass) {
        return db('Masses').insert(mass);
    }

    static async getById(id) {
        return db('Masses')
            .select(
                'Masses.id',
                'Masses.date',
                'Masses.celebrant_id',
                'Celebrants.religious_name as celebrant',
                'Masses.status',
                'Masses.intention_id',
                'Intentions.intention_text as intention',
                'Intentions.amount',
                'Intentions.wants_celebration_date as wants_notification',
                'Intentions.donor_id'
            )
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .leftJoin('Intentions', 'Masses.intention_id', 'Intentions.id')
            .where('Masses.id', id)
            .first();
    }

    static async update(mass) {
        return db('Masses')
            .where('id', mass.id)
            .update({
                date: mass.date,
                celebrant_id: mass.celebrant_id,
                intention_id: mass.intention_id,
                status: mass.status
            });
    }

    static async delete(id) {
        return db('Masses').where('id', id).del();
    }

    static async getMassesByCelebrantAndDate(celebrantId, date) {
        return db('Masses')
            .where('celebrant_id', celebrantId)
            .whereRaw('DATE(date) = DATE(?)', [date])
            .count('* as count')
            .first();
    }

    static async isCelebrantAvailable(celebrantId, date) {
        // Convertir la date au format YYYY-MM-DD si ce n'est pas déjà fait
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        // Vérifier si le célébrant a déjà une messe ce jour-là
        const existingMass = await db('Masses')
            .where('celebrant_id', celebrantId)
            .whereRaw('DATE(date) = ?', [formattedDate])
            .first();
        
        // Le célébrant est disponible s'il n'a pas déjà de messe ce jour-là
        return !existingMass;
    }

    static async getRandomAvailableCelebrant(date, excludedCelebrantIds = []) {
        // Convertir la date au format YYYY-MM-DD
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        // Trouver les célébrants déjà assignés ce jour-là
        const assignedCelebrants = await db('Masses')
            .select('celebrant_id')
            .whereRaw('DATE(date) = ?', [formattedDate]);
        
        // Extraire les IDs des célébrants déjà assignés
        const assignedCelebrantIds = assignedCelebrants.map(c => c.celebrant_id);
        
        // Combiner avec les IDs exclus passés en paramètre
        const allExcludedIds = [...new Set([...assignedCelebrantIds, ...excludedCelebrantIds])];
        
        // Trouver un célébrant disponible qui n'est pas déjà assigné ce jour-là
        const availableCelebrant = await db('Celebrants')
            .select('id', 'religious_name', 'title')
            .whereNotIn('id', allExcludedIds.filter(id => id != null))
            .orderByRaw('RANDOM()')
            .first();
        
        return availableCelebrant;
    }

    static async findNextAvailableCelebrant(targetDate) {
        return await Mass.getRandomAvailableCelebrant(targetDate);
    }

    static async findNextAvailableSlot() {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);
        
        for (let i = 0; i < 30; i++) {
            const dateToCheck = new Date(currentDate);
            dateToCheck.setDate(currentDate.getDate() + i);
            
            const specialDay = await db('SpecialDays')
                .where(db.raw('DATE(date) = DATE(?)', [dateToCheck]))
                .first();
                
            if (specialDay) {
                continue;
            }

            const availableCelebrant = await Mass.findNextAvailableCelebrant(dateToCheck);
            
            if (availableCelebrant) {
                return {
                    date: dateToCheck,
                    celebrant: availableCelebrant
                };
            }
        }
        
        return null;
    }

    static async getUpcomingMonth() {
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
                'Intentions.amount',
                'Intentions.wants_celebration_date as wants_notification',
                'Intentions.donor_id'
            )
            .orderBy('date');
    }

    static async getMassesByDateRange(startDate, endDate) {
        let query = db('Masses')
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .leftJoin('Intentions', 'Masses.intention_id', 'Intentions.id')
            .select(
                'Masses.id',
                'Masses.date',
                'Celebrants.religious_name as celebrant',
                'Intentions.intention_text as intention',
                'Masses.status',
            )
            .orderBy('Masses.date');
        
        if (startDate) {
            const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
            query = query.where(db.raw('DATE(Masses.date)'), '>=', formattedStartDate);
        }
        
        if (endDate) {
            const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
            query = query.where(db.raw('DATE(Masses.date)'), '<=', formattedEndDate);
        }
        
        return query;
    }

    static async getMassesByIntentionId(intentionId) {
        return db('Masses')
            .select(
                'Masses.id',
                'Masses.date',
                'Masses.status',
                'Celebrants.religious_name as celebrant_name',
                'Intentions.intention_text as intention',
                'Intentions.deceased'
            )
            .leftJoin('Celebrants', 'Masses.celebrant_id', 'Celebrants.id')
            .leftJoin('Intentions', 'Masses.intention_id', 'Intentions.id')
            .where('Masses.intention_id', intentionId)
            .orderBy('Masses.date');
    }
}

module.exports = Mass;