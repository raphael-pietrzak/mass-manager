const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à SQLite :', err.message);
    return;
  }
  console.log('Connexion à SQLite réussie.');

  // Création de la table si elle n'existe pas déjà
  db.run(`CREATE TABLE IF NOT EXISTS data_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    value TEXT
  )`, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table :', err.message);
    } else {
      console.log('Table créée ou existante.');

      // Insertion de données fictives
      const insertQuery = `INSERT INTO data_table (name, value) VALUES (?, ?)`;

      const data = [
        ['Alice', 'Lorem ipsum'],
        ['Bob', 'Dolor sit amet'],
        ['Charlie', 'Consectetur adipiscing'],
        ['Diana', 'Elit sed do eiusmod'],
      ];

      data.forEach((row) => {
        db.run(insertQuery, row, function (err) {
          if (err) {
            console.error('Erreur lors de l\'insertion des données :', err.message);
          } else {
            console.log(`Données ajoutées : ${row[0]} - ${row[1]}`);
          }
        });
      });
    }

    // Fermer la base de données une fois l'opération terminée
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la base de données :', err.message);
      } else {
        console.log('Base de données fermée.');
      }
    });
  });
});