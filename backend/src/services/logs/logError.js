const fs = require("fs")
const path = require("path")

const logsDir = path.join(__dirname, "../../../logs")
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir)
}

const errorLogPath = path.join(logsDir, "errors.log")

// Fonction générique pour ajouter une erreur dans le fichier de log
function logError(message, newlineBefore = false) {
	const timestamp = new Date().toLocaleString("fr-FR", {
		dateStyle: "short",
		timeStyle: "medium",
	})
	const prefix = newlineBefore ? "\n" : ""
	const logLine = `${prefix}[${timestamp}] [ERROR] ${message}\n`

	fs.appendFile(errorLogPath, logLine, (err) => {
		if (err) {
			console.error("Impossible d'écrire dans errors.log :", err)
		}
	})
}

// Optionnel : remplacer tous les console.error globalement
console.error = (...args) => {
	logError(args.map((a) => (a instanceof Error ? a.stack : a)).join(" "))
}

module.exports = { logError }
