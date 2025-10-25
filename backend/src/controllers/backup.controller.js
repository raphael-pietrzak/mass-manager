const { getBackupStream, restoreBackupFromBuffer } = require("../services/backup/backup.service")

function downloadBackup(req, res) {
	try {
		res.setHeader("Content-Disposition", `attachment; filename="backup_${Date.now()}.sqlite.gz"`)
		res.setHeader("Content-Type", "application/gzip")

		const stream = getBackupStream()
		stream
			.pipe(res)
			.on("finish", () => {
				console.log("Backup envoyé au client !")
			})
			.on("error", (err) => {
				console.error(err)
				if (!res.headersSent) res.status(500).send("Erreur lors du backup")
			})
	} catch (err) {
		console.error(err)
		if (!res.headersSent) res.status(500).send("Erreur serveur")
	}
}

async function restoreBackup(req, res) {
	try {
		if (!req.file) return res.status(400).send("Aucun fichier uploadé")

		const buffer = req.file.buffer // fichier reçu en mémoire

		await restoreBackupFromBuffer(buffer)

		res.status(200).send("Base de données restaurée avec succès !")
	} catch (err) {
		console.error(err)
		res.status(500).send("Erreur lors de la restauration de la BDD")
	}
}

module.exports = { downloadBackup, restoreBackup }
