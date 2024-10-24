const express = require('express');
const { db } = require('./database/db');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Exemple d'utilisation avec SQLite
app.get('/api/data', (req, res) => {
  db.all('SELECT * FROM data_table', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Données récupérées avec succès',
      data: rows,
    });
  });
});

// Exemple de route pour ajouter des données (SQL INSERT)
app.post('/api/data', (req, res) => {
  const { name, value } = req.body;
  db.run('INSERT INTO data_table (name, value) VALUES (?, ?)', [name, value], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Données ajoutées avec succès',
      id: this.lastID,
    });
  });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Le serveur écoute sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}/api/data`);
});