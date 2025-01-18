

// seeds/xxxxxx_seed_data.js

exports.seed = function(knex) {
  // Supprimez toutes les entrées existantes
  return knex('Masses').del()
    .then(function () {
      return knex('SpecialDays').del();
    })
    .then(function () {
      return knex('Intentions').del();
    })
    .then(function () {
      return knex('Donors').del();
    })
    .then(function () {
      return knex('Celebrants').del();
    })
    .then(function () {
      // Insérer des données fictives
      return knex('Donors').insert([
        { name: 'Jean Dupont', email: 'jean.dupont@example.com', phone: '0123456789', address: '1 rue de Paris', wants_notification: true },
        { name: 'Marie Curie', email: 'marie.curie@example.com', phone: '9876543210', address: '2 rue de Lyon', wants_notification: false },
      ]);
    })
    .then(function () {
      return knex('Celebrants').insert([
        { name: 'Chanoine Michel', email: 'chanoine.michel@example.com', is_available: true },
        { name: 'Chanoine Jean', email: 'chanoine.jean@example.com', is_available: true },
      ]);
    })
    .then(function () {
      return knex('Intentions').insert([
        { description: 'Intentions de prière pour la paix', amount: 20.0, donor_id: 1, date_requested: new Date() },
        { description: 'Intentions de prière pour les malades', amount: 15.0, donor_id: 2, date_requested: new Date() },
      ]);
    })
    .then(function () {
      return knex('Masses').insert([
        { date: new Date('2024-10-28'), celebrant_id: 1, intention_id: 1, status: 'scheduled' },
        { date: new Date('2024-10-30'), celebrant_id: 2, intention_id: 2, status: 'scheduled' },
      ]);
    })
    .then(function () {
      return knex('SpecialDays').insert([
        { date: new Date('2024-12-25'), note: 'Noël', number_of_masses: 3 },
      ]);
    });
};