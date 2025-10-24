const fs = require("fs")
const path = require("path")

const logFilePath = path.join(__dirname, "../../logs/cron.log")
const logsDir = path.join(__dirname, "../../logs")
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir)
}

// Fonction générique pour ajouter une ligne dans le fichier de log
function log(message, type = "SUCCESS", newlineBefore = false) {
	const timestamp = new Date().toLocaleString("fr-FR", {
		dateStyle: "short",
		timeStyle: "medium",
	})
	const prefix = newlineBefore ? "\n" : ""
	const logLine = `${prefix}[${timestamp}] [${type}] ${message}\n`

	fs.appendFile(logFilePath, logLine, (err) => {
		if (err) {
			console.error("Erreur lors de l'écriture du log :", err)
		}
	})
}

module.exports = { log }
