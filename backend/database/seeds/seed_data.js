

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
        { religious_name: 'Emmanuel', civil_first_name: 'Marc', civil_last_name: 'Lefébure', title: 'TRP', role: null },
        { religious_name: 'Dominique', civil_first_name: 'Pierre', civil_last_name: 'Laparra', title: 'RP', role: 'Prieur' },
        { religious_name: 'Maximilien', civil_first_name: 'Alban', civil_last_name: 'Lefébure', title: 'RP', role: 'Maître des écoles' },
        { religious_name: 'Michel', civil_first_name: 'Matthieu', civil_last_name: 'Leclère', title: 'RP', role: 'Prieur de Pau' },
        { religious_name: 'Hilaire', civil_first_name: 'Barthélémy', civil_last_name: 'Leclère', title: 'P', role: 'Maître des Novices' },
        { religious_name: 'Serge', civil_first_name: 'Jean-François', civil_last_name: 'Valeur', title: 'P', role: null },
        { religious_name: 'Philippe', civil_first_name: 'Hubert', civil_last_name: 'de La Tullaye', title: 'P', role: null },
        { religious_name: 'Gabriel', civil_first_name: 'Jean-Marie', civil_last_name: 'Lesueur', title: 'P', role: null },
        { religious_name: 'Jean-Baptiste', civil_first_name: 'Guillaume', civil_last_name: 'Golfier', title: 'P', role: null },
        { religious_name: 'Théophane', civil_first_name: 'Christophe', civil_last_name: 'de Villoutreys', title: 'P', role: null },
        { religious_name: 'Louis-Marie', civil_first_name: 'Jean-René', civil_last_name: 'Hingant', title: 'P', role: null },
        { religious_name: 'Jean', civil_first_name: 'Alain', civil_last_name: 'Leschenne', title: 'P', role: null },
        { religious_name: 'Ambroise', civil_first_name: 'Augustin', civil_last_name: 'Debut', title: 'P', role: null },
        { religious_name: 'Raphaël', civil_first_name: 'Matthieu', civil_last_name: 'Carmignac', title: 'P', role: 'Sous-Prieur' },
        { religious_name: 'André', civil_first_name: 'Tristan', civil_last_name: 'Soullier', title: 'P', role: null },
        { religious_name: 'Luc', civil_first_name: 'Robert-Emmanuel', civil_last_name: 'Turquais', title: 'P', role: null },
        { religious_name: 'Martin', civil_first_name: 'Armand', civil_last_name: 'Jozeau', title: 'P', role: null },
        { religious_name: 'Benoît', civil_first_name: 'Pierre', civil_last_name: 'de Saint-Albin', title: 'P', role: null },
        { religious_name: 'Etienne', civil_first_name: 'Raphaël', civil_last_name: 'Noël', title: 'P', role: null },
        { religious_name: 'Côme', civil_first_name: 'Hugues Kabis', civil_last_name: 'de Saint-Chamas', title: 'P', role: null },
        { religious_name: 'Grégoire', civil_first_name: 'Étienne', civil_last_name: 'Kieffer', title: 'P', role: null },
        { religious_name: 'Xavier', civil_first_name: 'Jean-Luc', civil_last_name: 'Davesne', title: 'P', role: null },
        { religious_name: 'Lazare', civil_first_name: 'Kevin', civil_last_name: 'Libermann', title: 'P', role: null },
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
        { date: '2025-03-28', celebrant_id: 1, intention: "Messe pour les défunts", status: 'scheduled' },
        { date: '2025-04-30', celebrant_id: 2, intention: "Messe pour les malades", status: 'scheduled' },
      ]);
    })
    .then(function () {
      return knex('SpecialDays').insert([
        { date: new Date('2024-12-25'), note: 'Noël', number_of_masses: 3 },
      ]);
    });
    
};


// CREATE TABLE religious_members (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   religious_name VARCHAR(50) NOT NULL,
//   civil_first_name VARCHAR(50) NOT NULL,
//   civil_last_name VARCHAR(50) NOT NULL,
//   title VARCHAR(10),
//   role VARCHAR(50)
// );

