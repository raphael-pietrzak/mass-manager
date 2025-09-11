const Mass = require("../models/mass.model")
const { format, addMonths, addYears, parseISO } = require("date-fns")
const MassService = require("./mass.service")
const Celebrant = require("../models/celebrant.model")

const RecurringIntentionService = {
	handleGenerateRecurringMassPreview: async (params) => {
		try {
			const {
				type,
				start_date,
				end_type,
				end_date,
				occurrences,
				position,
				weekday,
				celebrant_id,
				celebrant_name,
				celebrant_title,
				intention_text,
				deceased = false,
				usedCelebrantsByDate = {},
			} = params

			// Initialisation
			const masses = []
			let currentDate = typeof start_date === "string" ? parseISO(start_date) : start_date
			let occurrenceCount = 0
			const endDateObj = end_date ? parseISO(end_date) : null

			// Petite fonction utilitaire pour choisir un célébrant
			const getCelebrant = async (dateObj) => {
				if (celebrant_id) {
					// On a un célébrant fixe
					if (!celebrant_name || !celebrant_title) {
						// Compléter nom / titre depuis DB
						const celebrant = await Celebrant.getById(celebrant_id)
						return {
							id: celebrant_id,
							name: celebrant.religious_name,
							title: celebrant.title,
						}
					}
					return { id: celebrant_id, name: celebrant_name, title: celebrant_title }
				}

				// Sinon on choisit un disponible aléatoirement
				const formattedDate = format(dateObj, "yyyy-MM-dd")
				const used = usedCelebrantsByDate[formattedDate] ? Array.from(usedCelebrantsByDate[formattedDate]) : []
				const availableCelebrant = await Mass.getRandomAvailableCelebrant(formattedDate, used)
				if (!availableCelebrant) return null
				return {
					id: availableCelebrant.id,
					name: availableCelebrant.religious_name,
					title: availableCelebrant.celebrant_title,
				}
			}

			// Fonction pour construire l'objet messe
			const buildMass = (dateObj, celebrant) => ({
				date: format(dateObj, "yyyy-MM-dd"),
				intention: intention_text,
				deceased,
				celebrant_id: celebrant ? celebrant.id : null,
				celebrant_title: celebrant ? celebrant.title : null,
				celebrant_name: celebrant ? celebrant.name : "Non attribué",
				status: celebrant ? "scheduled" : "error",
			})

			// Boucle selon end_type
			while (
				(end_type === "date" && (!endDateObj || currentDate <= endDateObj)) ||
				(end_type === "occurrences" && occurrenceCount < occurrences) ||
				end_type === "no-end"
			) {
				const celebrant = await getCelebrant(currentDate)
				masses.push(buildMass(currentDate, celebrant))
				if (celebrant) {
					const dateKey = format(currentDate, "yyyy-MM-dd")
					if (!usedCelebrantsByDate[dateKey]) usedCelebrantsByDate[dateKey] = new Set()
					usedCelebrantsByDate[dateKey].add(parseInt(celebrant.id))
				}
				occurrenceCount++

				// avancer la date selon le type
				if (type === "yearly") currentDate = addYears(currentDate, 1)
				else if (type === "monthly") currentDate = addMonths(currentDate, 1)
				else {
					// TODO
					// type personnalisé (relative_position etc.)
					currentDate = addMonths(currentDate, 1) // ex. simplifié
				}

				if (end_type === "no-end" && occurrenceCount >= 2) break // ex: 2 masses max pour preview
			}
			return masses
		} catch (error) {
			console.error("Erreur lors de la génération de prévisualisation de messes:", error)
			throw error
		}
	},

	handleGenerateMonthlyMass: async (startDate, celebrant_id, end_type, end_date, occurences) => {},
	handlegenerateRelativePositionMass: async (startDate, celebrant_id, end_type, end_date, occurences) => {},
}

module.exports = RecurringIntentionService
