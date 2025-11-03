require("dotenv").config()
const express = require("express")
const cors = require("cors")

const { logError } = require("../src/services/logs/logError")

console.error = (
	() =>
	(...args) => {
		logError(args.map((a) => (a instanceof Error ? a.stack : a)).join(" "), "ERROR")
	}
)(console.error)

// Désactiver les logs en production
if (process.env.NODE_ENV === "production") {
	console.log = function () {}
}

// Import des routes
const donorsRoutes = require("./routes/donors.routes")
const celebrantsRoutes = require("./routes/celebrants.routes")
const intentionsRoutes = require("./routes/intentions.routes")
const massesRoutes = require("./routes/masses.routes")
const specialDaysRoutes = require("./routes/specialDays.routes")
const unavailableDayRoutes = require("./routes/unavailableDays.routes")
const recurrencesRoutes = require("./routes/recurrences.routes")
const exportRoutes = require("./routes/export.routes")
const authRoutes = require("./routes/auth.routes")
const mailerRoutes = require("./routes/mailer.routes")
const cronRoutes = require("./routes/cron.routes")
const backupRoutes = require("./routes/backup.routes")

const app = express()
const PORT = process.env.PORT || 3001
const cookieParser = require("cookie-parser")
app.use(cookieParser())

app.use(
	cors({
		origin: process.env.VITE_FRONT_URL || "http://localhost:5173",
		credentials: true, // permet d'envoyer/recevoir les cookies
	})
)

app.use(express.json())

const { authenticateToken } = require("./middlewares/auth.middleware")
// Middleware global pour sécuriser toutes les routes sauf celles publiques
app.use(authenticateToken)

// Utilisation des routes
app.use("/api/data/donors", donorsRoutes)
app.use("/api/data/celebrants", celebrantsRoutes)
app.use("/api/data/intentions", intentionsRoutes)
app.use("/api/data/masses", massesRoutes)
app.use("/api/data/special-days", specialDaysRoutes)
app.use("/api/data/unavailable-days", unavailableDayRoutes)
app.use("/api/data/recurrences", recurrencesRoutes)
app.use("/api/export", exportRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/email", mailerRoutes)
app.use("/api/cron", cronRoutes)
app.use("/api/backup", backupRoutes)

// Lancement du serveur
app.listen(PORT, () => {
	console.log(`Le serveur écoute sur le port ${PORT} !!!\n`)
	console.log("\n ----------------------- API PATHS ----------------------- \n")
	console.log(`donors       : ${process.env.API_URL}/api/data/donors`)
	console.log(`celebrants   : ${process.env.API_URL}/api/data/celebrants`)
	console.log(`intentions   : ${process.env.API_URL}/api/data/intentions`)
	console.log(`masses       : ${process.env.API_URL}/api/data/masses`)
	console.log(`special-days : ${process.env.API_URL}/api/data/special-days`)
	console.log(`unavailable-days : ${process.env.API_URL}/api/data/unavailable-days`)
	console.log(`recurrences  : ${process.env.API_URL}/api/data/recurrences`)
	console.log(`export masses: ${process.env.API_URL}/api/export/masses/[format]`)
	console.log("\n [CTRL + CLICK] on the links to open in browser")

	require("./services/cron/cron.service")
})
