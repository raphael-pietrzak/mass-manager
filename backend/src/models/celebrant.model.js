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

    getAvailableByDate: async (date) => {
        const dateString = date; // format attendu: '2025-03-01'

        // Sous-requête pour trouver les ID des célébrants qui ont déjà une messe avec une intention à cette date
        const ces =  db
            .select('c.*')
            .from('Celebrants as c')
            .whereNotIn('c.id', function() {
                this.select('m.celebrant_id')
                    .from('Masses as m')
                    .whereRaw('DATE(m.date) = ?', [dateString])
                    .andWhere(function() {
                        this.whereNotNull('m.intention')
                            .andWhere('m.intention', '!=', '');
                    });
            });
            console.log("dddddd", ces.toString());
        return ces;
    }
};


module.exports = Celebrant;