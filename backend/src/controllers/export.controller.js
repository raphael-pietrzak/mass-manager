const Mass = require('../models/mass.model');
const exportService = require('../services/export.service');

exports.exportToWord = async (req, res) => {
  try {
    // Récupérer les intentions de messe du mois à venir
    const masses = await Mass.getUpcomingMonth();
    
    // Générer le document Word
    const buffer = await exportService.generateWordDoc(masses);
    
    // Envoyer le document
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="intentions-messes.docx"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'exportation vers Word');
  }
};

exports.exportToExcel = async (req, res) => {
  try {
    // Récupérer les intentions de messe du mois à venir
    const masses = await Mass.getUpcomingMonth();
    
    // Générer le fichier Excel
    const buffer = await exportService.generateExcel(masses);
    
    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="intentions-messes.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'exportation vers Excel');
  }
};

exports.exportToPdf = async (req, res) => {
  try {
    // Récupérer les intentions de messe du mois à venir
    const masses = await Mass.getUpcomingMonth();
    
    // Générer le PDF
    const buffer = await exportService.generatePDF(masses);
    
    // Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="intentions-messes.pdf"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'exportation vers PDF');
  }
};
