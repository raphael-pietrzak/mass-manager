const db = require('../../config/database'); 


const Mass = {
    getAll: async () => {
        return db.select().from('Masses');
    }
};


module.exports = Mass;