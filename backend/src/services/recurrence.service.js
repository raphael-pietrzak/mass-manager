const Mass = require("../models/mass.model")
const { addDays, format, addYears } = require("date-fns")
const MassService = require("./mass.service")

const RecurringIntentionService = {
	handleGenerateDailyMass: async (startDate, celebrant_id, end_type, end_date, occurrences, intentionId, usedCelebrantsByDate = {}) => {
		let currentDate = startDate
		let occurrenceCount = 0
		const masses = []

		while ((end_type === "date" && currentDate <= end_date) || (end_type === "occurrences" && occurrenceCount < occurrences)) {
			console.log("Création messe pour la date:", format(currentDate, "yyyy-MM-dd"))
			const massData = {
				date: format(currentDate, "yyyy-MM-dd"),
				celebrant_id: celebrant_id || null,
				intention_id: intentionId,
				status: "scheduled",
			}
			await Mass.create(massData)

			// mise à jour des célébrants utilisés
			await MassService.updateUsedCelebrants(massData, usedCelebrantsByDate)
			masses.push(massData)
			occurrenceCount++
			currentDate = addDays(currentDate, 1)
		}
		return masses
	},

	handleGenerateAnnualMass: async (startDate, celebrant_id, end_type, end_date, occurrences, intentionId, usedCelebrantsByDate = {}) => {
		let currentDate = startDate
		let occurrenceCount = 0
		const masses = []
		const currentYear = new Date().getFullYear()

		// Cas end_type = no-end
		if (end_type === "no-end") {
			const startYear = new Date(startDate).getFullYear()

			// 1️⃣ Créer une messe pour cette année si startDate est encore cette année
			if (startYear <= currentYear) {
				console.log("Création messe pour cette année:", format(currentDate, "yyyy-MM-dd"))
				const massData = {
					date: format(currentDate, "yyyy-MM-dd"),
					celebrant_id: celebrant_id || null,
					intention_id: intentionId,
					status: "scheduled",
				}
				await Mass.create(massData)
				// mise à jour des célébrants utilisés
				await MassService.updateUsedCelebrants(massData, usedCelebrantsByDate)
				masses.push(massData)
			}

			// 2️⃣ Créer toujours une messe pour l'année prochaine
			const nextYearDate = addYears(new Date(currentDate), 1)
			console.log("Création messe pour l'année prochaine:", format(nextYearDate, "yyyy-MM-dd"))
			const nextMassData = {
				date: format(nextYearDate, "yyyy-MM-dd"),
				celebrant_id: celebrant_id || null,
				intention_id: intentionId,
				status: "scheduled",
			}
			await Mass.create(nextMassData)
			// mise à jour des célébrants utilisés
			await MassService.updateUsedCelebrants(nextMassData, usedCelebrantsByDate)
			masses.push(nextMassData)
		} else {
			// Cas end_type = occurences ou end_type = date
			while ((end_type === "date" && currentDate <= end_date) || (end_type === "occurrences" && occurrenceCount < occurrences)) {
				console.log("Création messe pour la date:", format(currentDate, "yyyy-MM-dd"))
				const massData = {
					date: format(currentDate, "yyyy-MM-dd"),
					celebrant_id: celebrant_id || null,
					intention_id: intentionId,
					status: "scheduled",
				}
				await Mass.create(massData)
				// mise à jour des célébrants utilisés
				await MassService.updateUsedCelebrants(massData, usedCelebrantsByDate)
				masses.push(massData)
				occurrenceCount++
				currentDate = addYears(currentDate, 1)
			}
		}
		return masses
	},

	handleGenerateMonthlyMass: async (startDate, celebrant_id, end_type, end_date, occurences) => {},
	handlegenerateRelativePositionMass: async (startDate, celebrant_id, end_type, end_date, occurences) => {},
}

module.exports = RecurringIntentionService
