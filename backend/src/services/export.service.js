const { Document, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType, Packer } = require('docx');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

class ExportService {
  async generateWordDoc(masses) {
    // Création d'un nouveau document Word
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Intentions de messes",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          this._createMassesTable(masses)
        ]
      }]
    });

    // Conversion en buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  async generateExcel(masses) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Intentions de messes');
    
    // En-têtes des colonnes
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Lieu', key: 'location', width: 20 },
      { header: 'Célébrant', key: 'celebrant', width: 20 },
      { header: 'Intention', key: 'intention', width: 40 },
      { header: 'Statut', key: 'status', width: 12 }
    ];
    
    // Style des en-têtes
    worksheet.getRow(1).font = { bold: true };
    
    // Données
    masses.forEach(mass => {
      worksheet.addRow({
        date: new Date(mass.date).toLocaleDateString('fr-FR'),
        type: mass.type,
        location: mass.location,
        celebrant: mass.celebrant_name,
        intention: mass.intention,
        status: mass.status
      });
    });
    
    // Génération du buffer
    return await workbook.xlsx.writeBuffer();
  }

  async generatePDF(masses) {
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
      doc.fontSize(20).text('Intentions de messes', { align: 'center' });
      doc.moveDown();
      
      // Tableau des messes
      
      const tableData = {
        headers: [
          { label: 'Date' },
          { label: 'Type' },
          { label: 'Lieu' },
          { label: 'Célébrant' },
          { label: 'Intention' },
          { label: 'Statut' }
        ],
        // rows: masses.map(mass => [
        //   new Date(mass.date).toLocaleDateString('fr-FR'),
        //   mass.type,
        //   mass.location,
        //   mass.celebrant_name,
        //   mass.intention,
        //   mass.status
        // ])
        rows:  [
            { date: '2025-03-28', type: 'basse', location: 'Chapelle principale', celebrant: 'Emmanuel', intention: 'Messe pour les défunts', status: 'scheduled' },
            { date: '2025-04-30', type: 'basse', location: 'Chapelle principale', celebrant: 'Dominique', intention: 'Messe pour les malades', status: 'scheduled' }
        ]
      };
      
      // Options du tableau
      const options = {
        prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'),
        prepareRow: () => doc.fontSize(10).font('Helvetica')
      };
      
      // Dessiner le tableau
      doc.table(tableData, options);
      
      doc.end();
    });
  }

  _createMassesTable(masses) {
    const rows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Date' })], width: { size: 15 } }),
          new TableCell({ children: [new Paragraph({ text: 'Type' })], width: { size: 10 } }),
          new TableCell({ children: [new Paragraph({ text: 'Lieu' })], width: { size: 20 } }),
          new TableCell({ children: [new Paragraph({ text: 'Célébrant' })], width: { size: 20 } }),
          new TableCell({ children: [new Paragraph({ text: 'Intention' })], width: { size: 40 } }),
          new TableCell({ children: [new Paragraph({ text: 'Statut' })], width: { size: 10 } })
        ]
      }),
      // Données
      ...masses.map(mass => new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ text: new Date(mass.date).toLocaleDateString('fr-FR') })]
          }),
          new TableCell({ 
            children: [new Paragraph({ text: mass.type })]
          }),
          new TableCell({ 
            children: [new Paragraph({ text: mass.location })]
          }),
          new TableCell({ 
            children: [new Paragraph({ text: mass.celebrant_name })]
          }),
          new TableCell({ 
            children: [new Paragraph({ text: mass.intention })]
          }),
          new TableCell({ 
            children: [new Paragraph({ text: mass.status })]
          })
        ]
      }))
    ];

    return new Table({
      rows: rows
    });
  }
}

module.exports = new ExportService();
