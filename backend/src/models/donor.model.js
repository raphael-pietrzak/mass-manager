

// models/Donor.js
const db = require('../../config/database'); // Connexion Knex

const Donor = {
  getAll: async () => {
    return db.select().from('Donors');
  },

  create: async (donor) => {
    return db('Donors').insert(donor);
  },

  getById: async (id) => {
    return db.select().from('Donors').where('id', id);
  },

  update: async (donor) => {
    return db('Donors').where('id', donor.id).update(donor);
  },

  delete: async (id) => {
    return db('Donors').where('id', id).del();
  }
};

module.exports = Donor;