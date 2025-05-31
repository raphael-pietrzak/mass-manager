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

	async generateWord(masses) {
		if (!masses || masses.length === 0) {
			throw new Error("Aucune donnée à exporter")
		}

		const celebrantsMap = {}

		for (const mass of masses) {
			const date = new Date(mass.date)
			const day = date.getDate()
			const month = date.getMonth()
			const year = date.getFullYear()

			const key = `${mass.celebrant_title} ${mass.celebrant}`
			if (!celebrantsMap[key]) celebrantsMap[key] = {}

			const pad = (n) => (n < 10 ? "0" + n : n)
			const massDateKey = `${year}-${pad(month + 1)}-${pad(day)}`
			celebrantsMap[key][massDateKey] = {
				intention: mass.intention,
				deceased: mass.type,
				date_type: mass.date_type,
			}
		}

		const allDates = masses.map((m) => new Date(m.date))
		const firstDate = allDates[0]
		const year = firstDate.getFullYear()
		const month = firstDate.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		const celebrants = Object.keys(celebrantsMap)
		const maxCelebrantsPerGroup = 3

		const pageWidthDxa = 12240
		const smallColWidth = 1200
		const largeColWidth = Math.floor(pageWidthDxa / maxCelebrantsPerGroup - smallColWidth)

		const celebrantGroups = []
		for (let i = 0; i < celebrants.length; i += maxCelebrantsPerGroup) {
			const group = celebrants.slice(i, i + maxCelebrantsPerGroup)
			while (group.length < maxCelebrantsPerGroup) group.push(null)
			celebrantGroups.push(group)
		}

		const rowsPerGroup = 2 + daysInMonth
		const maxTablesPerPage = 2
		const maxRowsPerPage = rowsPerGroup * maxTablesPerPage

		const tablesByGroup = celebrantGroups.map((group) => {
			const rowCount = 2 + daysInMonth
			const rows = []

			const titleRow = new TableRow({
				children: group.map(
					(name) =>
						new TableCell({
							children: [
								new Paragraph({
									text: name || "Colonne vide",
									alignment: AlignmentType.CENTER,
								}),
							],
							columnSpan: 2,
							shading: { fill: "F5F5F5" },
							width: { size: smallColWidth + largeColWidth, type: "dxa" },
						})
				),
			})

			const headerRow = new TableRow({
				children: group.flatMap(() => [
					new TableCell({
						children: [new Paragraph({ text: "Jour", alignment: AlignmentType.CENTER })],
						shading: { fill: "DDDDDD" },
						width: { size: smallColWidth, type: "dxa" },
					}),
					new TableCell({
						children: [new Paragraph({ text: "Intention", alignment: AlignmentType.CENTER })],
						shading: { fill: "DDDDDD" },
						width: { size: largeColWidth, type: "dxa" },
					}),
				]),
			})

			rows.push(titleRow, headerRow)

			for (let day = 1; day <= daysInMonth; day++) {
				const pad = (n) => (n < 10 ? "0" + n : n)
				const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`

				const row = new TableRow({
					children: group.flatMap((name) => {
						if (!name) {
							return [
								new TableCell({
									children: [new Paragraph({ text: `${day}`, alignment: AlignmentType.CENTER })],
									width: { size: smallColWidth, type: "dxa" },
								}),
								new TableCell({
									children: [new Paragraph({ text: "Colonne vide" })],
									width: { size: largeColWidth, type: "dxa" },
								}),
							]
						}

						const mass = celebrantsMap[name]?.[dateKey]
						const intention = mass
							? mass.intention +
							  (mass.deceased === 1 || mass.deceased === true || mass.deceased === "1" ? " (D)" : "") +
							  (mass.date_type === "specifique" ? " (Fixe)" : mass.date_type === "indifferente" ? " (Mobile)" : "")
							: ""

						return [
							new TableCell({
								children: [new Paragraph({ text: `${day}`, alignment: AlignmentType.CENTER })],
								width: { size: smallColWidth, type: "dxa" },
								shading: { fill: "F5F5F5" },
							}),
							new TableCell({
								children: [new Paragraph({ text: intention })],
								width: { size: largeColWidth, type: "dxa" },
							}),
						]
					}),
				})

				rows.push(row)
			}

			return {
				rowCount,
				table: new Table({ rows }),
			}
		})

		const sections = []
		let currentChildren = []

		const mainTitleParagraphs = [
			new Paragraph({
				text: "Intentions de messes",
				heading: HeadingLevel.HEADING1,
				alignment: AlignmentType.CENTER,
			}),
			new Paragraph({
				text: `Mois : ${firstDate.toLocaleString("fr-FR", {
					month: "long",
					year: "numeric",
				})}`,
				alignment: AlignmentType.CENTER,
			}),
			new Paragraph({ text: "" }),
		]

		let currentRowCount = 0
		let isFirstSection = true

		for (const { table, rowCount } of tablesByGroup) {
			if (currentRowCount + rowCount > maxRowsPerPage && currentChildren.length > 0) {
				sections.push({
					properties: {
						page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } },
					},
					children: isFirstSection ? mainTitleParagraphs.concat(currentChildren) : currentChildren,
				})
				currentChildren = []
				currentRowCount = 0
				isFirstSection = false
			}

			currentChildren.push(table)
			currentRowCount += rowCount
			currentChildren.push(new Paragraph({ text: "" }))
		}

		if (currentChildren.length > 0) {
			sections.push({
				properties: {
					page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } },
				},
				children: isFirstSection ? mainTitleParagraphs.concat(currentChildren) : currentChildren,
			})
		}

		const doc = new Document({ sections })
		return await Packer.toBuffer(doc)
	}

	async generateExcelIntention(intentions) {
		let totalAmount = 0
		try {
			const workbook = new ExcelJS.Workbook()
			const worksheet = workbook.addWorksheet("Intentions de dons")

			// Définir les colonnes
			worksheet.columns = [
				{ header: "Intention", key: "intention_text", width: 40 },
				{ header: "Type", key: "intention_type", width: 15 },
				{ header: "Montant (€)", key: "amount", width: 15 },
			]

			worksheet.getRow(1).font = { bold: true }

			// Remplir les lignes avec les données des intentions
			intentions.forEach((intention) => {
				const deceasedText = intention.deceased ? "(défunt)" : ""
				const dateTypeText = intention.date_type === "specifique" ? "(fixe)" : intention.date_type === "indifferente" ? "(mobile)" : ""
				const intentionTypeText =
					intention.intention_type === "novena"
						? "Neuvaine"
						: intention.intention_type === "thirty"
						? "Trentain"
						: intention.intention_type === "unit"
						? "Unité"
						: ""

				worksheet.addRow({
					intention_text: `${intention.intention_text || ""} ${deceasedText} ${dateTypeText}`.trim(),
					intention_type: intentionTypeText,
					amount: intention.amount || 0,
				})
				totalAmount = totalAmount + intention.amount
			})
			const totalRow = worksheet.addRow({ intention_text: "Montant total", amount: totalAmount })
			totalRow.font = { bold: true }

			return await workbook.xlsx.writeBuffer()
		} catch (error) {
			console.error("Erreur dans generateExcelIntention:", error)
			throw error
		}
	}
}

module.exports = new ExportService()
