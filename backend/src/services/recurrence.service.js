const Mass = require("../models/mass.model")
const { format, getDay, addMonths, startOfMonth, endOfMonth, addYears, eachDayOfInterval, getYear, parseISO } = require("date-fns")
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

			/**
			 * Renvoie la date du n-ième jour de la semaine ou du dernier jour de la semaine dans le mois
			 */
			const getNextRelativePositionDate = (fromDate, position, weekday) => {
				// Debug : afficher les paramètres reçus
				console.log("DEBUG getNextRelativePositionDate:", {
					fromDate: format(fromDate, "yyyy-MM-dd"),
					position,
					weekday,
					positionType: typeof position,
					weekdayType: typeof weekday,
				})

				let searchDate = new Date(fromDate)

				// Chercher dans les prochains mois
				for (let monthOffset = 0; monthOffset < 24; monthOffset++) {
					const currentMonth = addMonths(searchDate, monthOffset)
					const monthStart = startOfMonth(currentMonth)
					const monthEnd = endOfMonth(currentMonth)

					// Convertir weekday en nombre si c'est une string
					let adjustedWeekday
					if (typeof weekday === "string") {
						const weekdayMap = {
							sunday: 0,
							monday: 1,
							tuesday: 2,
							wednesday: 3,
							thursday: 4,
							friday: 5,
							saturday: 6,
						}
						adjustedWeekday = weekdayMap[weekday.toLowerCase()]
						if (adjustedWeekday === undefined) {
							// Si la string n'est pas reconnue, essayer de la convertir en nombre
							adjustedWeekday = parseInt(weekday)
						}
					} else {
						adjustedWeekday = weekday % 7
					}

					console.log(`DEBUG mois ${monthOffset}: ${format(currentMonth, "yyyy-MM")}, adjustedWeekday: ${adjustedWeekday}`)

					// Vérifier que adjustedWeekday est valide
					if (isNaN(adjustedWeekday) || adjustedWeekday < 0 || adjustedWeekday > 6) {
						console.error(`DEBUG: weekday invalide: ${adjustedWeekday}`)
						return null
					}

					const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
					const matchingDays = allDays.filter((d) => getDay(d) === adjustedWeekday)

					console.log(
						`DEBUG jours trouvés:`,
						matchingDays.map((d) => format(d, "yyyy-MM-dd"))
					)

					if (matchingDays.length === 0) continue

					let targetDate
					if (position === "last") {
						targetDate = matchingDays[matchingDays.length - 1]
					} else {
						// position est un nombre (1, 2, 3, 4) ou "first"
						let positionIndex
						if (typeof position === "string") {
							const positionMap = {
								first: 0,
								second: 1,
								third: 2,
								fourth: 3,
							}
							positionIndex = positionMap[position.toLowerCase()]
							if (positionIndex === undefined) {
								positionIndex = parseInt(position) - 1
							}
						} else {
							positionIndex = position - 1
						}
						console.log(`DEBUG positionIndex calculé: ${positionIndex}`)
						targetDate = matchingDays[positionIndex] || null
					}

					console.log(`DEBUG targetDate trouvée:`, targetDate ? format(targetDate, "yyyy-MM-dd") : null)

					// Si on trouve une date valide ET qu'elle est >= à fromDate
					if (targetDate && targetDate >= fromDate) {
						console.log(`DEBUG date valide retournée:`, format(targetDate, "yyyy-MM-dd"))
						return targetDate
					}
				}

				console.log("DEBUG: Aucune date trouvée")
				return null
			}

			if (end_type === "no-end") {
				if (type === "yearly") {
					// Déterminer le nombre d'occurrences selon l'année du start_date
					const currentYear = new Date().getFullYear()
					const startYear = getYear(currentDate)
					const totalOccurrences = startYear === currentYear ? 3 : startYear === currentYear + 1 ? 2 : 1

					for (let i = 0; i < totalOccurrences; i++) {
						const celebrant = await getCelebrant(currentDate)
						masses.push(buildMass(currentDate, celebrant))
						if (celebrant) {
							const dateKey = format(currentDate, "yyyy-MM-dd")
							if (!usedCelebrantsByDate[dateKey]) usedCelebrantsByDate[dateKey] = new Set()
							usedCelebrantsByDate[dateKey].add(parseInt(celebrant.id))
						}
						currentDate = addYears(currentDate, 1) // Avancer d'un an à chaque itération
					}
				}
				if (type === "monthly") {
					const now = new Date()
					const currentMonth = now.getMonth()
					const currentYear = now.getFullYear()

					// Est-ce que start_date est dans le mois en cours ?
					const isThisMonth = currentDate.getMonth() === currentMonth && currentDate.getFullYear() === currentYear

					// 13 si mois courant, 12 sinon
					const totalOccurrences = isThisMonth ? 13 : 12

					for (let i = 0; i < totalOccurrences; i++) {
						const celebrant = await getCelebrant(currentDate)
						masses.push(buildMass(currentDate, celebrant))

						if (celebrant) {
							const dateKey = format(currentDate, "yyyy-MM-dd")
							if (!usedCelebrantsByDate[dateKey]) {
								usedCelebrantsByDate[dateKey] = new Set()
							}
							usedCelebrantsByDate[dateKey].add(parseInt(celebrant.id))
						}
						// Avancer d’un mois, on garde le même jour
						currentDate = addMonths(currentDate, 1)
					}
				} else if (type === "relative_position") {
					// Gestion des positions relatives sans fin
					const totalOccurrences = 12 // Par défaut 12 occurrences
					// Trouver la première date valide à partir de currentDate
					let nextOccurrence = getNextRelativePositionDate(currentDate, position, weekday)

					for (let i = 0; i < totalOccurrences && nextOccurrence; i++) {
						const celebrant = await getCelebrant(nextOccurrence)
						masses.push(buildMass(nextOccurrence, celebrant))

						if (celebrant) {
							const dateKey = format(nextOccurrence, "yyyy-MM-dd")
							if (!usedCelebrantsByDate[dateKey]) {
								usedCelebrantsByDate[dateKey] = new Set()
							}
							usedCelebrantsByDate[dateKey].add(parseInt(celebrant.id))
						}

						// Chercher la prochaine occurrence (mois suivant)
						const nextMonth = addMonths(nextOccurrence, 1)
						nextOccurrence = getNextRelativePositionDate(nextMonth, position, weekday)
					}
				}
			} else {
				// Pour les positions relatives, s'assurer qu'on commence par une date valide
				if (type === "relative_position") {
					const firstValidDate = getNextRelativePositionDate(currentDate, position, weekday)
					if (firstValidDate) {
						currentDate = firstValidDate
					} else {
						console.warn(`Aucune date trouvée pour position ${position}, weekday ${weekday}`)
						return masses
					}
				}

				// Boucle selon end_type
				while ((end_type === "date" && (!endDateObj || currentDate <= endDateObj)) || (end_type === "occurrences" && occurrenceCount < occurrences)) {
					const celebrant = await getCelebrant(currentDate)
					masses.push(buildMass(currentDate, celebrant))

					if (celebrant) {
						const dateKey = format(currentDate, "yyyy-MM-dd")
						if (!usedCelebrantsByDate[dateKey]) usedCelebrantsByDate[dateKey] = new Set()
						usedCelebrantsByDate[dateKey].add(parseInt(celebrant.id))
					}
					occurrenceCount++

					// Avancer la date selon le type
					if (type === "yearly") {
						currentDate = addYears(currentDate, 1)
					} else if (type === "monthly") {
						currentDate = addMonths(currentDate, 1)
					} else if (type === "relative_position") {
						const nextMonth = addMonths(currentDate, 1)
						const nextDate = getNextRelativePositionDate(nextMonth, position, weekday)

						if (!nextDate) {
							console.warn(`Plus d'occurrences trouvées après ${format(currentDate, "yyyy-MM-dd")}`)
							break
						}

						currentDate = nextDate
					}
				}
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
