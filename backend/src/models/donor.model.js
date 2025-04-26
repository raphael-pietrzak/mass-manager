// models/Donor.js
const db = require('../../config/database'); // Connexion Knex

const Donor = {
  getAll: async () => {
    return db.select().from('Donors').orderBy('lastname', 'asc');
  },

  create: async (donor) => {
    const [id] = await db('Donors').insert(donor).returning('id');
    return id?.id ?? id;
  },

  getById: async (id) => {
    return db.select().from('Donors').where('id', id);
  },

  update: async (id, donor) => {
    return db('Donors').where('id', id).update(donor);
  },

  delete: async (id) => {
    return db('Donors').where('id', id).del();
  },

  // Nouvelle fonction pour trouver un donateur par email
  findByEmail: async (email) => {
    return db.select().from('Donors')
      .where('email', email)
      .first();
  },

  // Nouvelle fonction pour trouver un donateur par nom et prénom
  findByName: async (firstname, lastname) => {
    return db.select().from('Donors')
      .where({
        'firstname': firstname,
        'lastname': lastname
      })
      .first();
  }
};

module.exports = Donor;