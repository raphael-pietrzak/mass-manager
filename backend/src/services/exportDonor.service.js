const PDFDocument = require('pdfkit-table'); // Remplace totalement pdfkit ici

class ExportDonorService {

  async generateExcel(donors) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Liste des donateurs');
    
    // En-têtes des colonnes
    worksheet.columns = [
      { header: 'Nom', key: 'lastname', width: 15 },
      { header: 'Prénom', key: 'firstname', width: 12 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Tél', key: 'phone', width: 20 },
      { header: 'Adresse', key: 'address', width: 40 },
    ];
    
    // Style des en-têtes
    worksheet.getRow(1).font = { bold: true };
    
    // Données
    donors.forEach(donor => {
      worksheet.addRow({
        lastname: donor.lastname,
        firstname: donor.firstname,
        email: donor.email,
        phone: donor.phone,
        address: donor.address,
      });
    });
    
    // Génération du buffer
    return await workbook.xlsx.writeBuffer();
  }

  async generatePDF(donors) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
      
      // Collecte de tout l'output dans un buffer
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Titre
      doc.fontSize(20).text('Liste des donateurs', { align: 'center' });
      doc.moveDown();
      
      // Définir le tableau des données
      const tableData = {
        headers: [
          { label: 'Nom' },
          { label: 'Prénom' },
          { label: 'Email' },
          { label: 'Tél' },
          { label: 'Adresse' }
        ],
        rows: donors.map(donor => [
          donor.lastname,
          donor.firstname,
          donor.email || '',
          donor.phone || '',
          donor.address || '',
        ])
      };
      
      // Options du tableau
      const options = {
        prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'),
        prepareRow: () => doc.fontSize(10).font('Helvetica')
      };
      
      // Dessiner le tableau avec pdfkit-table
      doc.table(tableData, options);
      
      doc.end();
    });
  }
}

module.exports = new ExportDonorService();
