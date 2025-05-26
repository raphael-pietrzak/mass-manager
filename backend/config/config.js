const path = require("path")

// Configuration pour les chemins et autres paramètres
const config = {
	dbPath: path.resolve(__dirname, "database/mass_manager.db"),
  // Autres configurations à centraliser ici...
}

module.exports = config
