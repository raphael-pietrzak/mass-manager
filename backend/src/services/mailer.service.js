const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST, 
	port: process.env.SMTP_PORT, 
	secure: false, // true pour SSL, false pour STARTTLS
	auth: {
		user: process.env.EMAIL_USER, 
		pass: process.env.EMAIL_PASS,
	},
	tls: {
		rejectUnauthorized: false, // utile si le certificat est auto-signé
	},
})

module.exports = transporter
