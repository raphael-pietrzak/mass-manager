const db = require('../../config/database'); 


const Mass = {
    getAll: async () => {
        return db.select().from('Masses');
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
    }
};


module.exports = Mass;