const db = require('../../config/database');


const SpecialDay = {
    getAll: async () => {
        return db.select().from('SpecialDays');
    },

    create: async (specialDay) => {
        return db('SpecialDays').insert(specialDay);
    },

    getById: async (id) => {
        return db.select().from('SpecialDays').where('id', id);
    },

    update: async (specialDay) => {
        return db('SpecialDays').where('id', specialDay.id).update(specialDay);
    },

    delete: async (id) => {
        return db('SpecialDays').where('id', id).del();
    }
};


module.exports = SpecialDay;