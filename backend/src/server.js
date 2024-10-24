// const knex = require('knex');

// // Configuration de la connexion à la base de données SQLite
// const db = knex({
//   client: 'sqlite3',
//   connection: {
//     filename: './src/database/mass_manager.db',
//   },
//   useNullAsDefault: true, // Nécessaire pour SQLite
// });

// module.exports = db;


const express = require('express');
const db = require('./database/database');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/data/donors', async (req, res) => {
  try {
    const data = await db.select().from('Donors');
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.get('/api/data/celebrants', async (req, res) => {
  try {
    const data = await db.select().from('Celebrants');
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.get('/api/data/intentions', async (req, res) => {
  try {
    const data = await db.select().from('Intentions');
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.get('/api/data/masses', async (req, res) => {
  try {
    const data = await db.select().from('Masses');
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.get('/api/data/special-days', async (req, res) => {
  try {
    const data = await db.select().from('SpecialDays');
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Le serveur écoute sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}/api/data`);
  console.log('donors : http://localhost:3001/api/data/donors');
  console.log('celebrants : http://localhost:3001/api/data/celebrants');
  console.log('intentions : http://localhost:3001/api/data/intentions');
  console.log('masses : http://localhost:3001/api/data/masses');
  console.log('special-days : http://localhost:3001/api/data/special-days');
});