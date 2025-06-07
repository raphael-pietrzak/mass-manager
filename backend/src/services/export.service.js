const { Document, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType, Packer, WidthType } = require("docx")
const ExcelJS = require("exceljs")
const PDFDocument = require("pdfkit-table")

class ExportService {
	async generateExcel(masses) {
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet("Intentions de messes")

		worksheet.columns = [
			{ header: "Date", key: "date", width: 15 },
			{ header: "Célébrant", key: "celebrant", width: 20 },
			{ header: "Type", key: "type", width: 12 },
			{ header: "Intention", key: "intention", width: 40 },
		]

		worksheet.getRow(1).font = { bold: true }

		masses.forEach((mass) => {
			const celebrantName = mass.celebrant_title && mass.celebrant_religious_name ? 
				`${mass.celebrant_title} ${mass.celebrant_religious_name}` : 
				"Non assigné"

			worksheet.addRow({
				date: new Date(mass.date).toLocaleDateString("fr-FR"),
				celebrant: celebrantName,
				type: mass.deceased ? "défunt" : "",
				intention: mass.intention,
			})
		})

		return await workbook.xlsx.writeBuffer()
	}

	// Focntionne, ajouter colonne vide si plus de celebrant
	// Gérer intention_text qu'il soit bien aligné
	async generatePDF(masses) {
		if (!masses || masses.length === 0) {
			throw new Error("Aucune donnée à exporter")
		}

		// Regroupement des données par célébrant et date
		const celebrantsMap = {}
		for (const mass of masses) {
			const date = new Date(mass.date)
			const day = date.getDate()
			const month = date.getMonth()
			const year = date.getFullYear()
			const key = `${mass.celebrant_title} ${mass.celebrant}`

			if (!celebrantsMap[key]) celebrantsMap[key] = {}

			const pad = (n) => (n < 10 ? "0" + n : n)
			const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`
			celebrantsMap[key][dateKey] = {
				intention: mass.intention,
				deceased: mass.deceased,
				date_type: mass.date_type,
				donor_firstname: mass.donor_firstname || "",
				donor_lastname: mass.donor_lastname || "",
			}
		}

		const allDates = masses.map((m) => new Date(m.date))
		const firstDate = allDates[0]
		const year = firstDate.getFullYear()
		const month = firstDate.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		const celebrants = Object.keys(celebrantsMap)
		const maxCelebrantsPerGroup = 3

		// Découpage en groupes de 3 célébrants
		const celebrantGroups = []
		for (let i = 0; i < celebrants.length; i += maxCelebrantsPerGroup) {
			const group = celebrants.slice(i, i + maxCelebrantsPerGroup)
			while (group.length < maxCelebrantsPerGroup) group.push(null)
			celebrantGroups.push(group)
		}

		const doc = new PDFDocument({ size: "A4", margin: 30 })
		doc.font("Helvetica")

		// Titre principal
		doc.fontSize(15).text("Intentions de messes", { align: "center" })
		doc.fontSize(10).text(`Mois : ${firstDate.toLocaleString("fr-FR", { month: "long", year: "numeric" })}`, {
			align: "center",
		})
		doc.moveDown(1)

		for (const group of celebrantGroups) {
			// Calculs dimension tableau
			const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
			const colWidth = pageWidth / (maxCelebrantsPerGroup * 2)

			// Garde la position Y pour l'en-tête manuel
			const startY = doc.y
			let x = doc.page.margins.left

			doc.fontSize(10).fillColor("black").font("Helvetica-Bold")

			// Ligne 1 d'en-tête : noms des célébrants sur 2 colonnes (jour + intention)
			for (const name of group) {
				const cellWidth = colWidth * 2
				doc.rect(x, startY, cellWidth, 20).fill("#F5F5F5")
				doc.fillColor("black").text(name || "", x, startY + 5, {
					width: cellWidth,
					align: "center",
					height: 20,
				})
				x += cellWidth
			}

			// Position Y pour début du tableau (sous la ligne d'en-tête manuelle)
			const tableStartY = startY + 20 + 5

			// Ligne 2 d'en-tête : "Jour" et "Intention" répétés pour chaque célébrant
			const secondHeaderLabels = []
			for (let i = 0; i < maxCelebrantsPerGroup; i++) {
				secondHeaderLabels.push("Jour")
				secondHeaderLabels.push("Intention")
			}

			// Préparation des lignes du tableau (les données)
			const tableRows = []

			for (let day = 1; day <= daysInMonth; day++) {
				const pad = (n) => (n < 10 ? "0" + n : n)
				const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`

				const row = []
				for (const name of group) {
					if (!name) {
						row.push(`${day}`, "") // jour + cellule vide
						continue
					}

					const mass = celebrantsMap[name]?.[dateKey]
					let text = ""

					if (mass) {
						text = mass.intention || ""
						if (mass.deceased === 1 || mass.deceased === true || mass.deceased === "1") text += " (D)"
						if (mass.date_type === "specifique") text += " (Fixe)"
						else if (mass.date_type === "indifferente") text += " (Mobile)"

						const donor = `${mass.donor_firstname} ${mass.donor_lastname}`.trim()
						text += `\nDonateur : ${donor || "non renseigné"}`
					}

					row.push(`${day}`, text)
				}
				tableRows.push(row)
			}

			// Construction du tableau à passer à pdfkit-table
			const table = {
				headers: secondHeaderLabels,
				rows: tableRows,
			}

			// Affichage du tableau sous l'en-tête manuelle
			await doc.table(table, {
				x: doc.page.margins.left,
				y: tableStartY,
				width: pageWidth,
				prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
				prepareRow: () => doc.font("Helvetica").fontSize(8),
			})

			doc.moveDown()
			doc.addPage()
		}

		doc.end()

		return new Promise((resolve, reject) => {
			const chunks = []
			doc.on("data", (chunk) => chunks.push(chunk))
			doc.on("end", () => resolve(Buffer.concat(chunks)))
			doc.on("error", reject)
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

			const key = mass.celebrant_title && mass.celebrant_religious_name ? 
				`${mass.celebrant_title} ${mass.celebrant_religious_name}` : 
				"Non assigné"
			if (!celebrantsMap[key]) celebrantsMap[key] = {}

			const pad = (n) => (n < 10 ? "0" + n : n)
			const massDateKey = `${year}-${pad(month + 1)}-${pad(day)}`
			celebrantsMap[key][massDateKey] = {
				intention: mass.intention,
				deceased: mass.deceased,
				date_type: mass.date_type,
				donor_firstname: mass.donor_firstname || "",
				donor_lastname: mass.donor_lastname || "",
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
		const smallColWidth = 300
		const largeColWidth = Math.floor(pageWidthDxa / maxCelebrantsPerGroup - smallColWidth)

		const celebrantGroups = []
		for (let i = 0; i < celebrants.length; i += maxCelebrantsPerGroup) {
			const group = celebrants.slice(i, i + maxCelebrantsPerGroup)
			while (group.length < maxCelebrantsPerGroup) group.push(null)
			celebrantGroups.push(group)
		}

		const tablesByGroup = celebrantGroups.map((group) => {
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
						const intention = (() => {
							if (!mass) return ""

							let text = mass.intention || ""
							if (mass.deceased === 1 || mass.deceased === true || mass.deceased === "1") {
								text += " (D)"
							}
							if (mass.date_type === "specifique") {
								text += " (Fixe)"
							} else if (mass.date_type === "indifferente") {
								text += " (Mobile)"
							}

							const donor = (mass.donor_firstname || "") + " " + (mass.donor_lastname || "")
							text += donor.trim() ? ` \n Donateur : ${donor.trim()}` : " \n Donateur : non renseigné"

							return text
						})()

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
				table: new Table({ rows }),
			}
		})

		const sections = []
		let isFirstSection = true

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

		for (const { table } of tablesByGroup) {
			sections.push({
				properties: {
					page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } },
				},
				children: isFirstSection ? mainTitleParagraphs.concat([table]) : [table],
			})
			isFirstSection = false
		}

		const doc = new Document({ sections })
		return await Packer.toBuffer(doc)
	}

	async generateExcelIntention(intentions) {
		let totalAmount = 0
		try {
			const workbook = new ExcelJS.Workbook()
			const worksheet = workbook.addWorksheet("Intentions de messes")

			// Définir les colonnes
			worksheet.columns = [
				{ header: "Intention", key: "intention_text", width: 40 },
				{ header: "Type", key: "intention_type", width: 15 },
				{ header: "Donateur", key: "donor", width: 15 },
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
				const donorText = `${intention.firstname || ""} ${intention.lastname || ""}`.trim() || "Non renseigné"

				worksheet.addRow({
					intention_text: `${intention.intention_text || ""} ${deceasedText} ${dateTypeText}`.trim(),
					intention_type: intentionTypeText,
					donor: donorText,
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

	async generatePDFIntention(intentions) {
		return new Promise((resolve, reject) => {
			try {
				const doc = new PDFDocument({ margin: 30 })
				const buffers = []

				doc.on("data", buffers.push.bind(buffers))
				doc.on("end", () => {
					const pdfData = Buffer.concat(buffers)
					resolve(pdfData)
				})

				doc.fontSize(18).font("Helvetica-Bold").text("Intentions de messes", { align: "left" })
				doc.moveDown()

				const rows = []
				let totalAmount = 0

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

					const intentionText = `${intention.intention_text || ""} ${deceasedText} ${dateTypeText}`.trim()
					const amount = intention.amount || 0
					const donorText = `${intention.firstname || ""} ${intention.lastname || ""}`.trim() || "Non renseigné"

					rows.push([intentionText, intentionTypeText, donorText, amount.toFixed(2)])
					totalAmount += amount
				})

				// Ligne total - simple tableau de strings/nombres, pas d'objet
				rows.push(["Montant total", "", "", totalAmount.toFixed(2)])

				const table = {
					headers: [
						{ label: "Intention", property: "intention", width: 300, headerColor: "#D3D3D3", headerFont: "Helvetica-Bold" },
						{ label: "Type", property: "type", width: 50, headerColor: "#D3D3D3", headerFont: "Helvetica-Bold" },
						{ label: "Donateur", property: "donor", width: 150, headerColor: "#D3D3D3", headerFont: "Helvetica-Bold" },
						{ label: "Montant (€)", property: "amount", width: 80, headerColor: "#D3D3D3", headerFont: "Helvetica-Bold" },
					],
					rows: rows,
				}

				doc.table(table, {
					prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
					prepareRow: (row, indexColumn, indexRow) => {
						if (indexRow === rows.length - 1) {
							doc.font("Helvetica-Bold")
						} else {
							doc.font("Helvetica")
						}
						doc.fontSize(12)
					},
				})

				doc.end()
			} catch (error) {
				reject(error)
			}
		})
	}

	async generateWordIntention(intentions) {
		try {
			let totalAmount = 0

			// Construire les lignes du tableau
			const rows = [
				new TableRow({
					children: [
						new TableCell({
							width: { size: 40, type: WidthType.PERCENTAGE },
							children: [new Paragraph({ text: "Intention", bold: true })],
							shading: {
								fill: "D3D3D3",
							},
						}),
						new TableCell({
							width: { size: 10, type: WidthType.PERCENTAGE },
							children: [new Paragraph({ text: "Type", bold: true })],
							shading: {
								fill: "D3D3D3",
							},
						}),
						new TableCell({
							width: { size: 30, type: WidthType.PERCENTAGE },
							children: [new Paragraph({ text: "Donateur", bold: true })],
							shading: {
								fill: "D3D3D3",
							},
						}),
						new TableCell({
							width: { size: 10, type: WidthType.PERCENTAGE },
							children: [new Paragraph({ text: "Montant (€)", bold: true })],
							shading: {
								fill: "D3D3D3",
							},
						}),
					],
				}),
			]

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
				const donorText = `${intention.firstname || ""} ${intention.lastname || ""}`.trim() || "Non renseigné"

				rows.push(
					new TableRow({
						children: [
							new TableCell({
								children: [new Paragraph(`${intention.intention_text || ""} ${deceasedText} ${dateTypeText}`.trim())],
							}),
							new TableCell({
								children: [new Paragraph(intentionTypeText)],
							}),
							new TableCell({
								children: [new Paragraph(donorText)],
							}),
							new TableCell({
								children: [new Paragraph((intention.amount || 0).toString())],
							}),
						],
					})
				)

				totalAmount += intention.amount || 0
			})

			// Ligne total
			rows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [new Paragraph({ text: "Montant total", bold: true })],
							shading: { fill: "D3D3D3" },
						}),
						new TableCell({
							children: [new Paragraph("")],
							columnSpan: 2,
							shading: { fill: "D3D3D3" },
						}),
						new TableCell({
							children: [new Paragraph({ text: totalAmount.toString(), bold: true })],
							shading: { fill: "D3D3D3" },
						}),
					],
				})
			)

			const doc = new Document({
				sections: [
					{
						children: [
							new Paragraph({
								text: "Intentions de messes",
								heading: HeadingLevel.HEADING_1,
								spacing: { after: 300 },
							}),
							new Table({
								rows,
								width: {
									size: 100,
									type: WidthType.PERCENTAGE,
								},
							}),
						],
					},
				],
			})

			// Génère un buffer en Uint8Array (fichier Word en mémoire)
			const buffer = await Packer.toBuffer(doc)
			return buffer // tu peux ensuite l'envoyer en réponse HTTP, ou sauvegarder dans un fichier
		} catch (error) {
			console.error("Erreur dans generateWordIntention:", error)
			throw error
		}
	}
}

module.exports = new ExportService()
