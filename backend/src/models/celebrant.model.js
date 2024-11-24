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
    }
};


module.exports = Celebrant;