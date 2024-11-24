
const db = require('../../config/database'); 

const Intention = {
    getAll: () => db('Intentions').select('*'),
    findById: (id) => db('Intentions').where({ id }).first(),
    create: (intentionData) => db('Intentions').insert(intentionData).returning('*'),
    update: (id, intentionData) => db('Intentions').where({ id }).update(intentionData),
    delete: (id) => db('Intentions').where({ id }).del(),
};

module.exports = Intention;