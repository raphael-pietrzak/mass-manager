const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Créez ou ouvrez une base de données SQLite
const dbPath = path.join(__dirname, 'mass_manager.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
  }
});

// Fonction pour créer les tables
const createTables = () => {
  const createMassesTable = `
    CREATE TABLE IF NOT EXISTS Masses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATETIME NOT NULL,
      celebrant_id INTEGER,
      intention_id INTEGER,
      status TEXT CHECK(status IN ('scheduled', 'cancelled')),
      FOREIGN KEY (celebrant_id) REFERENCES Celebrants(id),
      FOREIGN KEY (intention_id) REFERENCES Intentions(id)
    );
  `;

  const createIntentionsTable = `
    CREATE TABLE IF NOT EXISTS Intentions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount DECIMAL,
      donor_id INTEGER,
      date_requested DATETIME,
      FOREIGN KEY (donor_id) REFERENCES Donors(id)
    );
  `;

  const createDonorsTable = `
    CREATE TABLE IF NOT EXISTS Donors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      address VARCHAR(255),
      wants_notification BOOLEAN DEFAULT 0
    );
  `;

  const createCelebrantsTable = `
    CREATE TABLE IF NOT EXISTS Celebrants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      is_available BOOLEAN DEFAULT 1
    );
  `;

  const createSpecialDaysTable = `
    CREATE TABLE IF NOT EXISTS SpecialDays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      note TEXT,
      number_of_masses INTEGER DEFAULT 0
    );
  `;

  // Exécutez les requêtes de création de tables
  db.serialize(() => {
    db.run(createMassesTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table Masses:', err.message);
      }
    });
    
    db.run(createIntentionsTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table Intentions:', err.message);
      }
    });
    
    db.run(createDonorsTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table Donors:', err.message);
      }
    });

    db.run(createCelebrantsTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table Celebrants:', err.message);
      }
    });

    db.run(createSpecialDaysTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table SpecialDays:', err.message);
      }
    });

    console.log('Tables créées avec succès.');
  });
};

// Appelez la fonction de création des tables
createTables();

// Fermez la connexion à la base de données à la fin
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base de données:', err.message);
    } else {
      console.log('Connexion à la base de données fermée.');
    }
    process.exit(0);
  });
});