const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  // Supprimer les entrées existantes
  return knex('Masses').del()
    .then(function () {
      return knex('SpecialDays').del();
    })
    .then(function () {
      return knex('Donors').del();
    })
    .then(function () {
      return knex('Celebrants').del();
    })
    .then(function () {
      return knex('Users').del();
    })
    .then(function () {
      // Réinitialiser les séquences d'auto-incrémentation
      return knex.raw("DELETE FROM sqlite_sequence WHERE name IN ('Masses', 'SpecialDays', 'Donors', 'Celebrants', 'Users')");
    })
    .then(function () {
      // Insérer des données fictives dans les tables
      return knex('Donors').insert([
        { firstname: 'Jean', lastname: 'Dupont', email: 'jean.dupont@example.com', phone: '0123456789', address: '1 rue de Paris', city: 'Paris', zip_code: '75001' },
        { firstname: 'Marie', lastname: 'Curie', email: 'marie.curie@example.com', phone: '9876543210', address: '2 rue de Lyon', city: 'Lyon', zip_code: '69002' },
        { firstname: 'John', lastname: 'Doe', email: 'john.doet@example.com', phone: '0123456789', address: '1 rue de Paris', city: 'Paris', zip_code: '75001' },
        { firstname: 'Jane', lastname: 'Smith', email: 'janesmith@example.com', address: '1 rue de Paris', city: 'Lyon', zip_code: '69001' },
        { firstname: 'Alice', lastname: 'Johnson', phone: '0123456789', address: '1 rue de Paris', city: 'Marseille', zip_code: '13001' },
        { firstname: 'Bob', lastname: 'Brown', email: 'bob.brown@example.com', phone: '0123456789', address: '1 rue de Paris', city: 'Nice', zip_code: '06000' },
        { firstname: 'Jacques', lastname: 'Michel', email: 'jaques.michelexample.com', phone: '0123456789', address: '1 rue de Paris', city: 'Montpellier', zip_code: '34000' },
      ]);
    })
    .then(function () {
      return knex('Celebrants').insert([
        { religious_name: 'Emmanuel', civil_firstname: 'Marc', civil_lastname: 'Lefébure', title: 'TRP', role: null },
        { religious_name: 'Dominique', civil_firstname: 'Pierre', civil_lastname: 'Laparra', title: 'RP', role: 'Prieur' },
        { religious_name: 'Maximilien', civil_firstname: 'Alban', civil_lastname: 'Lefébure', title: 'RP', role: 'Maître des écoles' },
        { religious_name: 'Michel', civil_firstname: 'Matthieu', civil_lastname: 'Leclère', title: 'RP', role: 'Prieur de Pau' },
        { religious_name: 'Hilaire', civil_firstname: 'Barthélémy', civil_lastname: 'Leclère', title: 'P', role: 'Maître des Novices' },
        { religious_name: 'Serge', civil_firstname: 'Jean-François', civil_lastname: 'Valeur', title: 'P', role: null },
        { religious_name: 'Philippe', civil_firstname: 'Hubert', civil_lastname: 'de La Tullaye', title: 'P', role: null },
        { religious_name: 'Gabriel', civil_firstname: 'Jean-Marie', civil_lastname: 'Lesueur', title: 'P', role: null },
        { religious_name: 'Jean-Baptiste', civil_firstname: 'Guillaume', civil_lastname: 'Golfier', title: 'P', role: null },
        { religious_name: 'Théophane', civil_firstname: 'Christophe', civil_lastname: 'de Villoutreys', title: 'P', role: null },
        { religious_name: 'Louis-Marie', civil_firstname: 'Jean-René', civil_lastname: 'Hingant', title: 'P', role: null },
        { religious_name: 'Jean', civil_firstname: 'Alain', civil_lastname: 'Leschenne', title: 'P', role: null },
        { religious_name: 'Ambroise', civil_firstname: 'Augustin', civil_lastname: 'Debut', title: 'P', role: null },
        { religious_name: 'Raphaël', civil_firstname: 'Matthieu', civil_lastname: 'Carmignac', title: 'P', role: 'Sous-Prieur' },
        { religious_name: 'André', civil_firstname: 'Tristan', civil_lastname: 'Soullier', title: 'P', role: null },
        { religious_name: 'Luc', civil_firstname: 'Robert-Emmanuel', civil_lastname: 'Turquais', title: 'P', role: null },
        { religious_name: 'Martin', civil_firstname: 'Armand', civil_lastname: 'Jozeau', title: 'P', role: null },
        { religious_name: 'Benoît', civil_firstname: 'Pierre', civil_lastname: 'de Saint-Albin', title: 'P', role: null },
        { religious_name: 'Etienne', civil_firstname: 'Raphaël', civil_lastname: 'Noël', title: 'P', role: null },
        { religious_name: 'Côme', civil_firstname: 'Hugues Kabis', civil_lastname: 'de Saint-Chamas', title: 'P', role: null },
        { religious_name: 'Grégoire', civil_firstname: 'Étienne', civil_lastname: 'Kieffer', title: 'P', role: null },
        { religious_name: 'Xavier', civil_firstname: 'Jean-Luc', civil_lastname: 'Davesne', title: 'P', role: null },
        { religious_name: 'Lazare', civil_firstname: 'Kevin', civil_lastname: 'Libermann', title: 'P', role: null },
      ]);

    })
    .then(function () {
      return knex('Masses').insert([
        { date: '2025-03-28', celebrant_id: 1, intention: "Messe pour les défunts", status: 'scheduled', deceased: true, amount: 100, wants_notification: true },
        { date: '2025-04-30', celebrant_id: 2, intention: "Messe pour les malades", status: 'pending', deceased: false, amount: 20, wants_notification: true },
        { date: '2025-05-01', celebrant_id: 3, intention: "Messe pour les vivants", status: 'scheduled', deceased: false, amount: 30, wants_notification: false },
        { date: '2025-05-02', celebrant_id: 4, intention: "Messe pour les défunts", status: 'scheduled',  deceased: true, amount: 25, wants_notification: true },
        { date: '2025-06-15', celebrant_id: 5, intention: "Messe pour les malades", status: 'pending',  deceased: false, amount: 45, wants_notification: false },
        { date: '2025-07-20', celebrant_id: 6, intention: "Messe pour les vivants", status: 'cancelled',  deceased: false, amount: 40, wants_notification: false },
        { date: '2025-05-02', celebrant_id: 7, intention: "Messe pour les défunts", status: 'scheduled',  deceased: true, amount: 25, wants_notification: true },
        { date: '2025-06-15', celebrant_id: 8, intention: "Messe pour les malades", status: 'pending',  deceased: false, amount: 45, wants_notification: false },
        { date: '2025-07-20', celebrant_id: 9, intention: "Messe pour les vivants", status: 'cancelled',  deceased: false, amount: 40, wants_notification: false },
        { date: '2025-05-02', celebrant_id: 10, intention: "Messe pour les défunts", status: 'scheduled',  deceased: true, amount: 25, wants_notification: true },
        { date: '2025-06-15', celebrant_id: 11, intention: "Messe pour les malades", status: 'pending',  deceased: false, amount: 45, wants_notification: false },
        { date: '2025-07-20', celebrant_id: 12, intention: "Messe pour les vivants", status: 'cancelled',  deceased: false, amount: 40, wants_notification: false },
        { date: '2025-05-02', celebrant_id: 13, intention: "Messe pour les défunts", status: 'scheduled',  deceased: true, amount: 25, wants_notification: true },
        { date: '2025-06-15', celebrant_id: 14, intention: "Messe pour les malades", status: 'pending',  deceased: false, amount: 45, wants_notification: false },
        { date: '2025-07-20', celebrant_id: 15, intention: "Messe pour les vivants", status: 'cancelled',  deceased: false, amount: 40, wants_notification: false },
        { date: '2025-05-02', celebrant_id: 16, intention: "Messe pour les défunts", status: 'scheduled',  deceased: true, amount: 25, wants_notification: true },
        { date: '2025-06-15', celebrant_id: 17, intention: "Messe pour les malades", status: 'pending',  deceased: false, amount: 45, wants_notification: false },
        { date: '2025-07-20', celebrant_id: 18, intention: "Messe pour les vivants", status: 'cancelled',  deceased: false, amount: 40, wants_notification: false },
        { date: '2025-05-02', celebrant_id: 19, intention: "Messe pour les défunts", status: 'scheduled',  deceased: true, amount: 25, wants_notification: true },
        { date: '2025-06-15', celebrant_id: 20, intention: "Messe pour les malades", status: 'pending',  deceased: false, amount: 45, wants_notification: false },
        { date: '2025-07-20', celebrant_id: 21, intention: "Messe pour les vivants", status: 'cancelled',  deceased: false, amount: 40, wants_notification: false },
        { date: '2025-05-02', celebrant_id: 22, intention: "Messe pour les défunts", status: 'scheduled',  deceased: true, amount: 25, wants_notification: true },
        { date: '2025-06-15', celebrant_id: 23, intention: "Messe pour les malades", status: 'pending',  deceased: false, amount: 45, wants_notification: false },
      ]);
    })
    .then(function () {
      return knex('SpecialDays').insert([
        { date: '2024-12-25', description: 'Noël', number_of_masses: 3, is_recurrent: true },
        { date: '2025-04-17', description: 'Jeudi Saint', number_of_masses: 0,  is_recurrent: false },
      ]);
    })
    .then(function () {
      return knex('Users').insert([
        { login_name: 'admin', password: bcrypt.hashSync('admin', 10), email: 'secretariat@lagrasse.org' }
      ]);
    });
};
