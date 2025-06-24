require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import des routes
const donorsRoutes = require('./routes/donors.routes');
const celebrantsRoutes = require('./routes/celebrants.routes');
const intentionsRoutes = require('./routes/intentions.routes');
const massesRoutes = require('./routes/masses.routes');
const specialDaysRoutes = require('./routes/specialDays.routes');
const unavailableDayRoutes = require('./routes/unavailableDays.routes');
const recurrencesRoutes = require('./routes/recurrences.routes');
const exportRoutes = require('./routes/export.routes');
const authRoutes = require('./routes/auth.routes');
const mailerRoutes = require('./routes/mailer.routes');

const app = express();
const PORT = process.env.PORT || 3001;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(cors({
  origin: process.env.VITE_FRONT_URL || 'http://localhost:5173',
  credentials: true,          // permet d'envoyer/recevoir les cookies
}));

app.use(express.json());

// Utilisation des routes
app.use('/api/data/donors', donorsRoutes);
app.use('/api/data/celebrants', celebrantsRoutes);
app.use('/api/data/intentions', intentionsRoutes);
app.use('/api/data/masses', massesRoutes);
app.use('/api/data/special-days', specialDaysRoutes);
app.use('/api/data/unavailable-days', unavailableDayRoutes)
app.use('/api/data/recurrences', recurrencesRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', mailerRoutes);

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Le serveur écoute sur le port ${PORT} !!!\n`);
  console.log('\n ----------------------- API PATHS ----------------------- \n');
  console.log('donors       : http://localhost:3001/api/data/donors');
  console.log('celebrants   : http://localhost:3001/api/data/celebrants');
  console.log('intentions   : http://localhost:3001/api/data/intentions');
  console.log('masses       : http://localhost:3001/api/data/masses');
  console.log('special-days : http://localhost:3001/api/data/special-days');
  console.log('unavailable-days : http://localhost:3001/api/data/unavailable-days');
  console.log('recurrences  : http://localhost:3001/api/data/recurrences');
  console.log('export masses: http://localhost:3001/api/export/masses/[format]');

  console.log('\n [CTRL + CLICK] on the links to open in browser');
});