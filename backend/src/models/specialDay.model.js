const db = require('../../config/database'); 


const SpecialDay = {
    getAll: async () => {
        return db.select().from('SpecialDays');
    }
};


module.exports = SpecialDay;