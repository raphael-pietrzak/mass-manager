const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function createMassIntentionsPDF(intentions) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // Format A4 (en points)

  // En-tête
  page.drawText('Intentions de Messes de la Semaine', {
    x: 50,
    y: 800,
    size: 18,
    color: rgb(0, 0, 0),
  });

  // Table des intentions
  let y = 750; // Position de départ

  page.drawText('Date', { x: 50, y, size: 12, color: rgb(0, 0, 0) });
  page.drawText('Heure', { x: 150, y, size: 12, color: rgb(0, 0, 0) });
  page.drawText('Personne', { x: 250, y, size: 12, color: rgb(0, 0, 0) });
  page.drawText('Lieu', { x: 400, y, size: 12, color: rgb(0, 0, 0) });

  y -= 20; // Descendre sous l'en-tête

  intentions.forEach(({ date, heure, personne, lieu }) => {
    page.drawText(date, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
    page.drawText(heure, { x: 150, y, size: 10, color: rgb(0, 0, 0) });
    page.drawText(personne, { x: 250, y, size: 10, color: rgb(0, 0, 0) });
    page.drawText(lieu, { x: 400, y, size: 10, color: rgb(0, 0, 0) });
    y -= 20;

    // Ajouter une nouvelle page si nécessaire
    if (y < 50) {
      y = 750;
      page = pdfDoc.addPage([595, 842]);
    }
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('Intentions-Messes.pdf', pdfBytes);
}

// Exemple d'intentions
const intentions = [
  { date: '2025-01-14', heure: '10:00', personne: 'Jean Dupont', lieu: 'Église Saint-Pierre' },
  { date: '2025-01-14', heure: '18:00', personne: 'Marie Martin', lieu: 'Cathédrale Notre-Dame' },
  { date: '2025-01-15', heure: '09:00', personne: 'Louis Durand', lieu: 'Église Saint-Paul' },
];

createMassIntentionsPDF(intentions).then(() => console.log('PDF généré !'));