

// models/Donor.js
const db = require('../../config/database'); // Connexion Knex

const Donor = {
  getAll: async () => {
    return db.select().from('Donors');
  }
};

module.exports = Donor;