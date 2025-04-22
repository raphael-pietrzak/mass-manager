const db = require('../../config/database'); 

const Intention = {
    getAll: () => db('Intentions')
        .select(
            'Intentions.*',
            'Donors.firstname',
            'Donors.lastname',
            'Donors.email'
        )
        .leftJoin('Donors', 'Intentions.donor_id', 'Donors.id'),
        
    findById: (id) => db('Intentions')
        .where('Intentions.id', id)
        .select(
            'Intentions.*',
            'Donors.firstname',
            'Donors.lastname',
            'Donors.email'
        )
        .leftJoin('Donors', 'Intentions.donor_id', 'Donors.id')
        .first(),
        
    create: (intentionData) => db('Intentions').insert(intentionData).returning('id')
        .then(([id]) => id?.id ?? id),
    
    update: (id, intentionData) => db('Intentions').where({ id }).update(intentionData),
    
    delete: (id) => db('Intentions').where({ id }).del(),
    
    getPendingIntentions: () => db('Intentions')
        .whereNotExists(function() {
            this.select('*').from('Masses').whereRaw('Masses.intention_id = Intentions.id');
        })
        .select(
            'Intentions.*',
            'Donors.firstname',
            'Donors.lastname',
            'Donors.email'
        )
        .leftJoin('Donors', 'Intentions.donor_id', 'Donors.id')
};

module.exports = Intention;