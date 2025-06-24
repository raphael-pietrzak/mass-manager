const transporter = require("../services/mailer.service")
const fetch = require("node-fetch")

const sendEmail = async (req, res) => {
	const { to, subject, text } = req.body

	try {
		const mailOptions = {
			from: `Secrétariat Abbaye de Lagrasse <${process.env.EMAIL_USER}>`,
			to,
			subject,
			text,
		}
		const info = await transporter.sendMail(mailOptions)
		console.log("Email envoyé, réponse SMTP :", info)
		res.status(200).json({ message: "Email envoyé avec succès" })
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email:", error)
		res.status(500).json({ error: "Erreur lors de l'envoi de l'email" })
	}
}

// AJOUTER celebrant_id dans les routes d'export
const sendIntentionByCelebrant = async (req, res) => {
	const { to, subject, text, startDate, endDate } = req.body

	if (!to || !text || !startDate || !endDate) {
		return res.status(400).json({ error: "Champs requis manquants (to, text, startDate, endDate)" })
	}

	try {
		// 1. Appel de la route PDF interne
		const pdfUrl = `http://localhost:3001/api/export/masses/pdf?startDate=${startDate}&endDate=${endDate}`
		const response = await fetch(pdfUrl)

		if (!response.ok) {
			throw new Error(`Erreur lors de la récupération du PDF : ${response.statusText}`)
		}

		const pdfBuffer = await response.buffer()

		// 2. Préparation de l'e-mail
		const mailOptions = {
			from: `Secrétariat Abbaye de Lagrasse <${process.env.EMAIL_USER}>`,
			to,
			subject: subject || "Intention de messe",
			text,
			html: `<p>${text.replace(/\n/g, "<br>")}</p>`,
			attachments: [
				{
					filename: `intention_messes_${startDate}_to_${endDate}.pdf`,
					content: pdfBuffer,
					contentType: "application/pdf",
				},
			],
		}

		// 3. Envoi
		const info = await transporter.sendMail(mailOptions)

		res.status(200).json({ message: "Email avec PDF envoyé avec succès" })
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email:", error)
		res.status(500).json({ error: "Erreur lors de l'envoi de l'email" })
	}
}

module.exports = {
	sendEmail,
	sendIntentionByCelebrant,
}
