const db = require('../../config/database'); 


const Celebrant = {
    getAll: async () => {
        return db.select().from('Celebrants');
    }
};


module.exports = Celebrant;