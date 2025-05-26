const { Document, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType, Packer } = require("docx")
const ExcelJS = require("exceljs")
const PDFDocument = require("pdfkit-table")

class ExportService {
	async generateExcel(masses) {
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet("Intentions de messes")

		// En-têtes des colonnes
		worksheet.columns = [
			{ header: "Date", key: "date", width: 15 },
			{ header: "Célébrant", key: "celebrant", width: 20 },
			{ header: "Type", key: "type", width: 12 },
			{ header: "Intention", key: "intention", width: 40 },
		]

		// Style des en-têtes
		worksheet.getRow(1).font = { bold: true }

		// Données
		masses.forEach((mass) => {
			worksheet.addRow({
				date: new Date(mass.date).toLocaleDateString("fr-FR"),
				celebrant: `${mass.celebrant_title} ${mass.celebrant}`,
				type: mass.type === 1 ? "défunt" : "",
				intention: mass.intention,
			})
		})

		// Génération du buffer
		return await workbook.xlsx.writeBuffer()
	}

	async generatePDF(masses) {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({ margin: 30, size: "A4" })

			// Collecte de tout l'output dans un buffer
			const buffers = []
			doc.on("data", buffers.push.bind(buffers))
			doc.on("end", () => {
				const pdfData = Buffer.concat(buffers)
				resolve(pdfData)
			})

			// Titre
			doc.fontSize(20).text("Intentions de messes", { align: "center" })
			doc.moveDown()

			// Tableau des messes

			const tableData = {
				headers: [{ label: "Date" }, { label: "Célébrant" }, { label: "Type" }, { label: "Intention" }],
				rows: masses.map((mass) => [
					new Date(mass.date).toLocaleDateString("fr-FR"),
					`${mass.celebrant_title} ${mass.celebrant}`,
					mass.type === 1 ? "défunt" : "",
					mass.intention,
				]),
			}

			// Options du tableau
			const options = {
				prepareHeader: () => doc.fontSize(10).font("Helvetica-Bold"),
				prepareRow: () => doc.fontSize(10).font("Helvetica"),
			}

			// Dessiner le tableau
			doc.table(tableData, options)

			doc.end()
		})
	}
}

module.exports = new ExportService()
