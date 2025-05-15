const db = require('../../config/database'); 


const Celebrant = {
    getAll: async () => {
        return db.select().from('Celebrants');
    },

    create: async (celebrant) => {
        return db('Celebrants').insert(celebrant);
    },

    getById: async (id) => {
        return db.select().from('Celebrants').where('id', id);
    },

    update: async (celebrant) => {
        return db('Celebrants').where('id', celebrant.id).update(celebrant);
    },

    delete: async (id) => {
        return db('Celebrants').where('id', id).del();
    },

    getUnavailableDates: async (celebrantId) => {
        // Récupérer toutes les dates où le célébrant a déjà une messe avec une intention
        const result = await db
            .select(db.raw('DISTINCT DATE(date) as date'))
            .from('Masses')
            .where('celebrant_id', celebrantId)
            .orderBy('date');
        
        // Formater les dates en tableau de chaînes
        return result.map(row => row.date);
    }
};

module.exports = Celebrant;