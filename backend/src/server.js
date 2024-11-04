
const express = require('express');
const db = require('./database/database');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');


app.use(cors());

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

app.delete('/api/data/intentions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db('Intentions').where('id', id).del();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression de l\'intention');
  }
});

app.post('/api/data/intentions', async (req, res) => {
  try {
    
    console.log("\n\n");
    console.log("##################################################");
    console.log("# RECUPERATION DES DONNEES : " + new Date().toLocaleString() + " #");
    console.log("##################################################");
    console.log("\n\n");
    console.log(req.body);

    // Insertion de l'intention, du donateur et des messes
    const donor = {
      name: req.body.brotherName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    const donorId = await db('Donors').insert(donor);
    console.log("donorId : ", donorId);
    
    const intention = {
      description: req.body.intention,
      amount: req.body.amount,
      donor_id: donorId[0],
      date_requested: req.body.date
    };

    const intentionId = await db('Intentions').insert(intention);
    console.log("intentionId : ", intentionId);

    for (let i = 0; i < req.body.date; i++) {
      const mass = {
        date: req.body.massDate,
        celebrant_id: 0,
        intention_id: intentionId[0]
      };

      const massId = await db('Masses').insert(mass);
      console.log("massId : ", massId);

    }

    res.status(201).send('Intention enregistrée');


  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});



// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Le serveur écoute sur le port ${PORT} \n\n`);
  console.log('Api paths : ');
  console.log('donors : http://localhost:3001/api/data/donors');
  console.log('celebrants : http://localhost:3001/api/data/celebrants');
  console.log('intentions : http://localhost:3001/api/data/intentions');
  console.log('masses : http://localhost:3001/api/data/masses');
  console.log('special-days : http://localhost:3001/api/data/special-days');
});