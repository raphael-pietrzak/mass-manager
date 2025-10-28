const Cron = require("../models/cron.model")
const { log } = require("../services/logs/logger")

exports.checkMassesAndIntentions = async (req, res) => {
	log("Routine modification statut en terminé", "TRACE", true)
	try {
		const { updatedMasses, updatedIntentions } = await Cron.checkMassesAndIntentions()
		if (updatedMasses.length > 0) {
			log(`Messes mises à jour : ${updatedMasses.join(", ")}`)
		}
		if (updatedIntentions.length > 0) {
			log(`Intentions mises à jour : ${updatedIntentions.join(", ")}`)
		} else {
			log("Aucune Messe ou Intentions à mettre à jour", "INFO")
		}
		res.send({ updatedMasses, updatedIntentions })
	} catch (err) {
		log(`Erreur lors de l’exécution de la tâche CRON : ${err.message}`, "ERROR")
		res.status(500).send({ error: err.message || "Erreur exécution tâche cron" })
	}
}

exports.assignAnnualMassesWithNoEnd = async (req, res) => {
	log("Routine Messes annuelles", "TRACE", true)
	try {
		const { processedIntentions, createdMasses } = await Cron.assignAnnualMassesWithNoEnd()
		if (processedIntentions.length === 0) {
			log("Aucune intention récurrente trouvée pour cette année", "INFO")
		} else {
			log(`Intentions traitées (${processedIntentions.length}): ${processedIntentions.join(", ")}`)
			log(`${createdMasses.length} Messe(s) créée(s) et assignée(s)`, "SUCCESS")
		}
		res.send({ processedIntentions, createdMasses })
	} catch (err) {
		log(`Erreur lors de l’exécution de la tâche CRON : ${err.message}`, "ERROR")
		res.status(500).send({ error: err.message || "Erreur exécution tâche cron" })
	}
}

exports.assignMonthlyMassesWithNoEnd = async (req, res) => {
	log("Routine Messes mensuelles", "TRACE", true)
	try {
		const { processedIntentions, createdMasses } = await Cron.assignMonthlyMassesWithNoEnd()
		if (processedIntentions.length === 0) {
			log("Aucune intention récurrente mensuelle trouvée pour ce mois", "INFO")
		} else {
			log(`Intentions traitées (${processedIntentions.length}): ${processedIntentions.join(", ")}`)
			log(`${createdMasses.length} Messe(s) créée(s) et assignée(s)`, "SUCCESS")
		}
		res.send({ processedIntentions, createdMasses })
	} catch (err) {
		log(`Erreur lors de l’exécution de la tâche CRON : ${err.message}`, "ERROR")
		res.status(500).send({ error: err.message || "Erreur exécution tâche cron" })
	}
}

exports.assignMonthlyRelativePositionMassesWithNoEnd = async (req, res) => {
	log("Routine Messes mensuelles position relative", "TRACE", true)
	try {
		const { processedIntentions, createdMasses } = await Cron.assignMonthlyRelativePositionMassesWithNoEnd()
		if (processedIntentions.length === 0) {
			log("Aucune intention récurrente mensuelle position relative trouvée pour ce mois", "INFO")
		} else {
			log(`Intentions traitées (${processedIntentions.length}): ${processedIntentions.join(", ")}`)
			log(`${createdMasses.length} Messe(s) créée(s) et assignée(s)`, "SUCCESS")
		}
		res.send({ processedIntentions, createdMasses })
	} catch (err) {
		log(`Erreur lors de l’exécution de la tâche CRON : ${err.message}`, "ERROR")
		res.status(500).send({ error: err.message || "Erreur exécution tâche cron" })
	}
}
