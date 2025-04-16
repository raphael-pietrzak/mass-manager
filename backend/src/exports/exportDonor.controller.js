const Donor = require('../models/donor.model');
const exportDonorService = require('../services/exportDonor.service');

exports.exportToExcel = async (req, res) => {
  try {
    // Récupérer tous les doneurs
    const donors = await Donor.getAll();
    
    // Générer le fichier Excel
    const buffer = await exportDonorService.generateExcel(donors);
    
    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="liste des donateurs.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'exportation vers Excel');
  }
};

exports.exportToPdf = async (req, res) => {
  try {
    // Récupérer tous les doneurs
    const donors = await Donor.getAll();
    
    // Générer le PDF
    const buffer = await exportDonorService.generatePDF(donors);
    
    // Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="liste des donateurs.pdf"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'exportation vers PDF');
  }
};
