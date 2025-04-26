const Mass = require('../models/mass.model');
const exportService = require('../services/export.service');


exports.exportToExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Récupérer les masses selon les filtres de date fournis
    
    
    const masses = await Mass.getMassesByDateRange(startDate, endDate);
    
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
    const { startDate, endDate } = req.query;
    
    // Récupérer les masses selon les filtres de date fournis
    const masses = await Mass.getMassesByDateRange(startDate, endDate);
    
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
