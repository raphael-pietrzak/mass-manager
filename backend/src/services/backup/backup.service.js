const fs = require("fs")
const zlib = require("zlib")
const path = require("path")

const DB_PATH = path.join(__dirname, "../../../database/mass_manager.db")

function getBackupStream() {
	const gzip = zlib.createGzip()
	const fileStream = fs.createReadStream(DB_PATH)
	return fileStream.pipe(gzip)
}

async function restoreBackupFromBuffer(buffer) {
	return new Promise((resolve, reject) => {
		// Décompresse le fichier gzip en mémoire
		zlib.gunzip(buffer, (err, decompressed) => {
			if (err) return reject(err)

			// Écrit le fichier décompressé directement à l’emplacement de la DB
			fs.writeFile(DB_PATH, decompressed, (err) => {
				if (err) return reject(err)
				resolve()
			})
		})
	})
}

module.exports = { getBackupStream, restoreBackupFromBuffer }
