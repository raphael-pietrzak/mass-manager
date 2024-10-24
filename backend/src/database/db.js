require('dotenv').config();
const config = require('../config');
const sqlite3 = require('sqlite3').verbose();
// const mongoose = require('mongoose');

// Choisir le type de base de données (sqlite ou mongodb)
const dbType = process.env.DB_TYPE || 'sqlite';

// Connexion SQLite
let db;
if (dbType === 'sqlite') {
  db = new sqlite3.Database(config.dbPath, (err) => {
    if (err) {
      console.error('Erreur lors de la connexion à SQLite :', err.message);
    } else {
      console.log('Connexion à SQLite réussie.');
    }
  });
}

// // Connexion MongoDB (utilisé uniquement si nécessaire)
// let mongoConnection;
// if (dbType === 'mongodb') {
//   mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//       mongoConnection = mongoose.connection;
//       console.log('Connexion à MongoDB réussie.');
//     })
//     .catch(err => {
//       console.error('Erreur lors de la connexion à MongoDB :', err.message);
//     });
// }

module.exports = { db /* mongoConnection */ };