const dataController = require('./controllers/data.controller');

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;
const cors = require('cors');

app.use(cors());
app.use(express.json());



app.get('/api/data/donors', dataController.getDonors);
app.get('/api/data/celebrants', dataController.getCelebrants);
app.get('/api/data/intentions', dataController.getIntentions);
app.get('/api/data/masses', dataController.getMasses);
app.get('/api/data/special-days', dataController.getSpecialDays);

app.post('/api/data/intentions', dataController.createIntention);
app.delete('/api/data/intentions/:id', dataController.deleteIntention);



// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Le serveur écoute sur le port ${PORT} !!!\n`);
  console.log('\n ----------------------- API PATHS ----------------------- \n');
  console.log('donors       : http://localhost:3001/api/data/donors');
  console.log('celebrants   : http://localhost:3001/api/data/celebrants');
  console.log('intentions   : http://localhost:3001/api/data/intentions');
  console.log('masses       : http://localhost:3001/api/data/masses');
  console.log('special-days : http://localhost:3001/api/data/special-days');

  console.log('\n [CTRL + CLICK] on the links to open in browser');
});