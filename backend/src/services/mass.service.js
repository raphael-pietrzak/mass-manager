const Mass = require("../models/mass.model")
const Intention = require("../models/intention.model")
const Celebrant = require("../models/celebrant.model")

const MassService = {
	/**
	 * Génère une prévisualisation des messes en fonction des paramètres fournis
	 *
	 * @param {Object} params - Paramètres pour la prévisualisation
	 * @param {string} params.intention_text - Le texte d'intention
	 * @param {boolean} params.deceased - Si l'intention est pour un défunt
	 * @param {string} params.start_date - Date de début souhaitée pour les messes (facultatif)
	 * @param {number} params.mass_count - Nombre de messes à prévoir
	 * @param {number} params.celebrant_id - ID du célébrant sélectionné (facultatif)
	 * @param {string} params.date_type - Type de date: 'imperative', 'desired', 'indifferent'
	 * @param {string} params.intention_type - Type d'intention: 'unit', 'novena', 'thirty'
	 * @returns {Array} Prévisualisation des messes
	 */
	generateMassPreview: async (params) => {
		try {
			const {
				intention_text,
				deceased = false,
				start_date = null,
				mass_count = 1,
				celebrant_id = null,
				date_type = "indifferent",
				intention_type,
			} = params

			const masses = []
			const usedCelebrantsByDate = {}

			const isNovena = intention_type === "novena"
			const isTrentain = intention_type === "thirty"
			const count = isNovena ? 9 : isTrentain ? 30 : mass_count

			// CAS SPÉCIAL : Novena ou Trentain avec date indifférente (création sans célébrant)
			if ((isNovena || isTrentain) && date_type === "indifferent") {
				console.log(`Création d'une intention ${intention_type} sans dates imposées (pas de célébrant affecté)`)
				if (!celebrant_id) {
					for (let i = 0; i < count; i++) {
						masses.push({
							date: null,
							intention: intention_text,
							deceased,
							celebrant_id: null,
							celebrant_title: null,
							celebrant_name: null,
							status: "pending",
						})
					}
				} else {
					const celebrant = await Celebrant.getById(celebrant_id)
					for (let i = 0; i < count; i++) {
						masses.push({
							date: null,
							intention: intention_text,
							deceased,
							celebrant_id: celebrant_id,
							celebrant_title: celebrant.title,
							celebrant_name: celebrant.religious_name,
							status: "pending",
						})
					}
				}

				return masses
			}

			// CAS SPÉCIAL : Novena ou Trentain avec date impérative ou souhaitée
			if ((isNovena || isTrentain) && start_date && (date_type === "imperative" || date_type === "desired")) {
				const result = await MassService.handleNeuvaineOrTrentain(start_date, celebrant_id, intention_text, deceased, usedCelebrantsByDate, count)

				if (result) {
					result.forEach((mass) => {
						if (!usedCelebrantsByDate[mass.date]) {
							usedCelebrantsByDate[mass.date] = new Set()
						}
						usedCelebrantsByDate[mass.date].add(parseInt(mass.celebrant_id))
						masses.push(mass)
					})
				}

				return masses
			}

			// CAS STANDARDS : Messes à l'unité

			// Si une date de début est fournie (impérative ou souhaitée)
			if (start_date && (date_type === "imperative" || date_type === "desired")) {
				// Générer un tableau de dates à partir de start_date
				const dates = []
				for (let i = 0; i < mass_count; i++) {
					const date = new Date(start_date)
					date.setDate(date.getDate() + i)
					dates.push(date.toISOString().split("T")[0])
				}
				for (let i = 0; i < dates.length; i++) {
					const date = dates[i]

					if (!usedCelebrantsByDate[date]) {
						usedCelebrantsByDate[date] = new Set()
					}

					// CAS 1 & 2: Date impérative
					if (date_type === "imperative") {
						const massData = await MassService.handleImperativeDate(date, celebrant_id, intention_text, deceased, usedCelebrantsByDate)
						// Si massData est null, c'est un échec (pas de célébrant disponible)
						if (!massData) {
							masses.push({
								date,
								intention: intention_text,
								deceased: deceased,
								celebrant_id: null,
								celebrant_title: null,
								celebrant_name: "Aucun célébrant disponible",
								status: "error",
								error: "no_celebrant_available",
							})
						} else {
							masses.push(massData)
							// Mettre à jour les célébrants utilisés
							if (massData.celebrant_id) {
								usedCelebrantsByDate[date].add(parseInt(massData.celebrant_id))
							}
						}
					}
					// CAS 3 & 4: Date souhaitée
					else if (date_type === "desired") {
						const massData = await MassService.handlePreferredDate(date, celebrant_id, intention_text, deceased, usedCelebrantsByDate)

						masses.push(massData)
						// Mettre à jour les célébrants utilisés
						if (massData.celebrant_id) {
							const dateToUse = massData.date || date
							if (!usedCelebrantsByDate[dateToUse]) {
								usedCelebrantsByDate[dateToUse] = new Set()
							}
							usedCelebrantsByDate[dateToUse].add(parseInt(massData.celebrant_id))
						}
					}
				}
			}
			// CAS 5 & 6: Date indifférente
			else {
				console.log(`Traitement de ${mass_count} messes avec date indifférente`)
				const indifferentDatesResult = await MassService.handleIndifferentDates(
					mass_count,
					celebrant_id,
					intention_text,
					deceased,
					usedCelebrantsByDate
				)
				for (const mass of indifferentDatesResult) {
					// Si on a pas de célebrant spécifique (pas de celebrant_id passé), on affiche "Non attribuée"
					if (!mass.celebrant_id && mass.status === "pending") {
						mass.celebrant_name = "Non attribuée"
					}
					masses.push(mass)
				}
			}

			return masses
		} catch (error) {
			console.error("Erreur lors de la génération de prévisualisation de messes:", error)
			throw error
		}
	},

	/**
	 * Gère le cas d'une date impérative
	 */
	handleImperativeDate: async (date, celebrant_id, intention_text, deceased, usedCelebrantsByDate) => {
		// Si un célébrant spécifique est sélectionné
		if (celebrant_id) {
			// Vérifier si le célébrant est disponible à cette date précise
			const isAvailable =
				(await Mass.isCelebrantAvailable(celebrant_id, date)) &&
				(!usedCelebrantsByDate[date] || !usedCelebrantsByDate[date].has(parseInt(celebrant_id)))

			if (isAvailable) {
				const celebrant = await Celebrant.getById(celebrant_id)
				return {
					date,
					intention: intention_text,
					deceased: deceased,
					celebrant_id: celebrant.id,
					celebrant_title: celebrant.celebrant_title,
					celebrant_name: celebrant.religious_name,
					status: "scheduled",
				}
			} else {
				// Échec: célébrant indisponible à cette date
				return null
			}
		}
		// Pas de célébrant spécifique (chercher n'importe quel célébrant disponible)
		else {
			// Récupérer les célébrants déjà utilisés à cette date
			const usedCelebrants = usedCelebrantsByDate[date] ? Array.from(usedCelebrantsByDate[date]) : [] 
			// Trouver un célébrant disponible à cette date
			const availableCelebrant = await Mass.getRandomAvailableCelebrant(date, usedCelebrants)

			if (availableCelebrant) {
				return {
					date,
					intention: intention_text,
					deceased: deceased,
					celebrant_id: availableCelebrant.id,
					celebrant_title: availableCelebrant.celebrant_title,
					celebrant_name: availableCelebrant.religious_name,
					status: "scheduled",
				}
			} else {
				// Échec: aucun célébrant disponible à cette date
				return null
			}
		}
	},

	/**
	 * Gère le cas d'une date souhaitée
	 */
	handlePreferredDate: async (date, celebrant_id, intention_text, deceased, usedCelebrantsByDate) => {
		// Si un célébrant spécifique est sélectionné
		if (celebrant_id) {
			// Vérifier si le célébrant est disponible à cette date
			const isAvailable =
				(await Mass.isCelebrantAvailable(celebrant_id, date)) &&
				(!usedCelebrantsByDate[date] || !usedCelebrantsByDate[date].has(parseInt(celebrant_id)))

			if (isAvailable) {
				const celebrant = await Celebrant.getById(celebrant_id)
				return {
					date,
					intention: intention_text,
					deceased: deceased,
					celebrant_id: celebrant.id,
					celebrant_title: celebrant.celebrant_title,
					celebrant_name: celebrant.religious_name,
					status: "scheduled",
				}
			} else {
				// Chercher la date disponible la plus proche pour ce célébrant
				const slot = await Mass.findNextAvailableSlotForCelebrant(celebrant_id, usedCelebrantsByDate)

				if (slot) {
					return {
						original_date: date, // Conserver la date souhaitée initialement
						date: slot.date.toISOString().split("T")[0],
						intention: intention_text,
						deceased: deceased,
						celebrant_id: slot.celebrant.id,
						celebrant_title: slot.celebrant.celebrant_title,
						celebrant_name: slot.celebrant.religious_name,
						status: "scheduled",
						changed_date: true,
					}
				} else {
					// Aucune date disponible pour ce célébrant
					return {
						date: null,
						intention: intention_text,
						deceased: deceased,
						celebrant_id: celebrant_id,
						celebrant_name: "Aucune disponibilité",
						status: "error",
						error: "no_availability",
					}
				}
			}
		}
		// Pas de célébrant spécifique
		else {
			// Trouver un célébrant disponible à cette date
			const usedCelebrants = usedCelebrantsByDate[date] ? Array.from(usedCelebrantsByDate[date]) : []
			const availableCelebrant = await Mass.getRandomAvailableCelebrant(date, usedCelebrants)

			if (availableCelebrant) {
				return {
					date,
					intention: intention_text,
					celebrant_id: availableCelebrant.id,
					celebrant_title: availableCelebrant.celebrant_title,
					celebrant_name: availableCelebrant.religious_name,
					status: "scheduled",
				}
			} else {
				// Chercher la date la plus proche avec un célébrant disponible
				const slot = await Mass.findNextAvailableSlot(usedCelebrantsByDate)

				if (slot) {
					return {
						original_date: date, // Conserver la date souhaitée initialement
						date: slot.date.toISOString().split("T")[0],
						intention: intention_text,
						celebrant_id: slot.celebrant.id,
						celebrant_name: slot.celebrant.religious_name,
						celebrant_title: slot.celebrant.celebrant_title,
						status: "scheduled",
						changed_date: true,
					}
				} else {
					// Aucune date disponible
					return {
						date: null,
						intention: intention_text,
						celebrant_id: null,
						celebrant_name: "Aucune disponibilité",
						status: "error",
						error: "no_availability",
					}
				}
			}
		}
	},

	/**
	 * Gère le traitement des messes avec dates indifférentes
	 */
	handleIndifferentDates: async (mass_count, celebrant_id, intention_text, deceased, usedCelebrantsByDate) => {
		const masses = []
		console.log(`Début du traitement des dates indifférentes. Célébrant spécifique: ${celebrant_id || "non"}`)

		for (let i = 0; i < mass_count; i++) {
			console.log(`Traitement de la messe ${i + 1}/${mass_count}`)
			let massData

			if (celebrant_id) {
				massData = await MassService.handleIndifferentDateWithCelebrant(celebrant_id, intention_text, deceased, usedCelebrantsByDate)
			} else {
				massData = await MassService.handleIndifferentDate(intention_text)
			}

			masses.push(massData)
			await MassService.updateUsedCelebrants(massData, usedCelebrantsByDate)
		}

		console.log(`Fin du traitement des dates indifférentes. ${masses.length} messes traitées`)
		return masses
	},

	/**
	 * Met à jour le suivi des célébrants utilisés
	 */
	updateUsedCelebrants: async (massData, usedCelebrantsByDate) => {
		if (massData.celebrant_id && massData.date) {
			const dateToUse = massData.date
			console.log(`Mise à jour des célébrants utilisés pour la date ${dateToUse}`)

			if (!usedCelebrantsByDate[dateToUse]) {
				usedCelebrantsByDate[dateToUse] = new Set()
			}
			usedCelebrantsByDate[dateToUse].add(parseInt(massData.celebrant_id))

			console.log(`Célébrant ${massData.celebrant_id} ajouté pour la date ${dateToUse}`)
		}
	},

	/**
	 * Gère le cas d'une date indifférente avec un célébrant spécifique
	 */
	handleIndifferentDateWithCelebrant: async (celebrant_id, intention_text) => {
		// On garde le célébrant, mais on n'affecte aucune date
		const celebrant = await Celebrant.getById(celebrant_id)

		return {
			date: null, // Pas de date attribuée
			intention: intention_text,
			celebrant_id: celebrant.id,
			celebrant_title: celebrant.celebrant_title,
			celebrant_name: celebrant.religious_name,
			status: "pending",
		}
	},

	/**
	 * Gère le cas d'une date indifférente sans célébrant spécifique
	 * Cherche la combinaison qui optimise l'équilibre des charges
	 */
	handleIndifferentDate: async (intention_text) => {
		return {
			date: null, // Pas de date
			intention: intention_text,
			status: "pending",
		}
	},

	/**
	 * Gère le cas d'une neuvaine ou d'un trentain
	 */
	handleNeuvaineOrTrentain: async (startDate, celebrant_id, intention_text, deceased, usedCelebrantsByDate, mass_count = 9) => {
		const dates = []
		const start = new Date(startDate)
		const year = start.getFullYear()
		const month = start.getMonth() + 1

		// Générer toutes les dates consécutives
		for (let i = 0; i < mass_count; i++) {
			const date = new Date(startDate)
			date.setDate(date.getDate() + i)
			dates.push(date.toISOString().split("T")[0]) // Format 'YYYY-MM-DD'
		}

		// Cas 1 : célébrant spécifique
		if (celebrant_id) {
			// Vérifie disponibilité sur tous les jours
			for (const date of dates) {
				const isAvailable =
					(await Mass.isCelebrantAvailable(celebrant_id, date)) &&
					(!usedCelebrantsByDate[date] || !usedCelebrantsByDate[date].has(parseInt(celebrant_id)))
				if (!isAvailable)
					throw new Error(
						`Ce célébrant n'est disponible pour toute la période de ${mass_count === 9 ? "la neuvaine" : "du trentain"} du ${dates[0]} au ${
							dates[dates.length - 1]
						}`
					)
			}

			const celebrant = await Celebrant.getById(celebrant_id)
			return dates.map((date) => ({
				date,
				intention: intention_text,
				deceased,
				celebrant_id: celebrant.id,
				celebrant_title: celebrant.celebrant_title,
				celebrant_name: celebrant.religious_name,
				status: "scheduled",
			}))
		}

		// Cas 2 : pas de célébrant spécifique — cherche un célébrant dispo sur toute la période
		const allCelebrants = await Celebrant.getAll()
		// Filtrer ceux dispo tous les jours
		const availableAllDays = []

		for (const celebrant of allCelebrants) {
			let available = true

			for (const date of dates) {
				const notUsed = !usedCelebrantsByDate[date] || !usedCelebrantsByDate[date].has(celebrant.id)
				const free = await Mass.isCelebrantAvailable(celebrant.id, date)

				if (!free || !notUsed) {
					available = false
					break
				}
			}

			if (available) {
				const massCount = await Celebrant.getMassCountForMonth(celebrant.id, year, month)
				availableAllDays.push({
					...celebrant,
					mass_count: massCount || 0,
				})
			}
		}

		// Si aucun célébrant n'est disponible pour toute la période, throw une erreur
		if (availableAllDays.length === 0) {
			throw new Error(
				`Aucun célébrant n'est disponible pour toute la période de ${mass_count === 9 ? "la neuvaine" : "du trentain"} du ${dates[0]} au ${
					dates[dates.length - 1]
				}`
			)
		}

		// Choisir celui qui a le moins de messes
		// Choisir le célébrant qui a le moins de messes dans le mois
		availableAllDays.sort((a, b) => a.mass_count - b.mass_count)
		const selected = availableAllDays[0]

		return dates.map((date) => ({
			date,
			intention: intention_text,
			deceased,
			celebrant_id: selected.id,
			celebrant_title: selected.title,
			celebrant_name: selected.religious_name,
			status: "scheduled",
		}))
	},

	/**
	 * --------------------------------------------------------
	 * Répartition des messes des intentions ponctuelles (unité)
	 * --------------------------------------------------------
	 */

	handleIndifferentDateWithCelebrantForPonctualIntentions: async (celebrant_id, intention_text, deceased, usedCelebrantsByDate) => {
		// Chercher la prochaine date disponible pour ce célébrant
		const slot = await Mass.findNextAvailableSlotForCelebrant(celebrant_id, usedCelebrantsByDate)

		if (slot) {
			return {
				date: slot.date.toISOString().split("T")[0],
				intention: intention_text,
				deceased,
				celebrant_id: celebrant_id,
				celebrant_name: slot.celebrant.religious_name,
				status: "scheduled",
			}
		} else {
			// Aucune date disponible pour ce célébrant
			return {
				date: null,
				intention: intention_text,
				deceased,
				celebrant_id: celebrant_id,
				celebrant_name: "Aucune disponibilité",
				status: "error",
				error: "no_availability",
			}
		}
	},

	handleIndifferentDateWithoutCelebrantForPonctualIntention: async (intention_id, intention_text, deceased, usedCelebrantsByDate) => {
		const intention = await Intention.findById(intention_id)
		console.log(intention)
		if (intention.intention_type === "unit" && intention.number_of_masses > 1) {
			const slots = await Mass.findAvailableSlotsForMultipleMasses(intention.number_of_masses, usedCelebrantsByDate)
			if (!slots) {
				return {
					date: null,
					intention: intention_text,
					deceased,
					celebrant_id: null,
					celebrant_name: "Aucune disponibilité",
					status: "error",
					error: "not_enough_slots",
				}
			}

			return slots.map((slot) => ({
				date: slot.date.toISOString().split("T")[0],
				intention: intention_text,
				deceased,
				celebrant_id: slot.celebrant.id,
				celebrant_name: slot.celebrant.religious_name,
				status: "scheduled",
			}))
		}

		// Cas simple 1 messe

		// Chercher la prochaine date avec un célébrant dispo
		const slot = await Mass.findNextAvailableSlot(usedCelebrantsByDate)

		if (slot) {
			return {
				date: slot.date.toISOString().split("T")[0],
				intention: intention_text,
				deceased: deceased,
				celebrant_id: slot.celebrant.id,
				celebrant_name: slot.celebrant.religious_name,
				status: "scheduled",
			}
		} else {
			return {
				date: null,
				intention: intention_text,
				deceased: deceased,
				celebrant_id: null,
				celebrant_name: "Aucune disponibilité",
				status: "error",
				error: "no_availability",
			}
		}
	},

	assignToExistingMasses: async (intentions) => {
		const allUpdatedMasses = []
		const usedCelebrantsByDate = {}

		for (const intention of intentions) {
			const { id: intention_id, intention_text, deceased } = intention
			const masses = await Mass.findUnscheduledMassesByIntention(intention_id)

			for (let i = 0; i < masses.length; i++) {
				const mass = masses[i]

				let assigned
				if (mass.celebrant_id) {
					assigned = await MassService.handleIndifferentDateWithCelebrantForPonctualIntentions(
						mass.celebrant_id,
						intention_text,
						deceased,
						usedCelebrantsByDate
					)
				} else {
					const data = await MassService.handleIndifferentDateWithoutCelebrantForPonctualIntention(
						intention_id,
						intention_text,
						deceased,
						usedCelebrantsByDate
					)

					if (data.status === "error") {
						return {
							error: true,
							type: "noDate",
							celebrantId: null,
						}
					}

					assigned = Array.isArray(data) ? data[i] : data
				}

				if (!assigned || assigned.status === "error") {
					return {
						error: true,
						type: mass.celebrant_id ? "noDateForCelebrant" : "noDate",
						celebrantId: mass.celebrant_id || null,
					}
				}

				await Mass.update({
					id: mass.id,
					date: assigned.date,
					celebrant_id: assigned.celebrant_id,
					intention_id: intention_id,
					status: "scheduled",
				})

				allUpdatedMasses.push({
					...mass,
					date: assigned.date,
					celebrant_id: assigned.celebrant_id,
					status: "scheduled",
				})
				await MassService.updateUsedCelebrants(assigned, usedCelebrantsByDate)
			}
			await Intention.update(intention.id, { status: "in_progress" })
		}
		return allUpdatedMasses
	},

	/**
	 * ------------------------------------------------
	 * Répartition des messes des Neuvaine et trentains
	 * ------------------------------------------------
	 */

	/**
	 * Trouve la première date où un célébrant spécifique peut assurer une série de jours consécutifs
	 */
	findConsecutiveDatesForCelebrant: async (celebrant_id, daysNeeded, usedCelebrantsByDate) => {
		const today = new Date()
		const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10)
		const searchStart = new Date(today.getFullYear(), today.getMonth() + offset, 1)
		searchStart.setHours(12, 0, 0, 0)

		const maxSearchDays = 100

		for (let dayOffset = 0; dayOffset <= maxSearchDays; dayOffset++) {
			const startDate = new Date(searchStart)
			startDate.setDate(startDate.getDate() + dayOffset)

			let allDaysAvailable = true

			for (let offset = 0; offset < daysNeeded; offset++) {
				const checkDate = new Date(startDate)
				checkDate.setDate(startDate.getDate() + offset)
				const dateStr = checkDate.toISOString().split("T")[0]

				const isAvailable = await Mass.isCelebrantAvailable(celebrant_id, dateStr)
				const notAlreadyUsed = !usedCelebrantsByDate[dateStr] || !usedCelebrantsByDate[dateStr].has(parseInt(celebrant_id))

				if (!isAvailable || !notAlreadyUsed) {
					allDaysAvailable = false
					break
				}
			}

			if (allDaysAvailable) {
				return startDate
			}
		}

		return null
	},

	/**
	 * Assigne des dates consécutives pour une neuvaine/trentain avec célébrant spécifique
	 */
	assignNeuvaineOrTrentainWithSpecificCelebrant: async (masses, celebrant_id, intention_text, deceased, usedCelebrantsByDate, massCount) => {
		// Trouver la première date disponible où le célébrant peut commencer la série
		const startDate = await MassService.findConsecutiveDatesForCelebrant(celebrant_id, massCount, usedCelebrantsByDate)

		if (!startDate) {
			console.error(`Aucune période de ${massCount} jours consécutifs disponible pour le célébrant ${celebrant_id}`)
			return null
		}

		const celebrant = await Celebrant.getById(celebrant_id)
		const assignedMasses = []

		// Créer les données d'assignation pour chaque jour consécutif
		for (let i = 0; i < massCount; i++) {
			const date = new Date(startDate)
			date.setDate(date.getDate() + i)
			const dateStr = date.toISOString().split("T")[0]

			assignedMasses.push({
				date: dateStr,
				intention: intention_text,
				deceased,
				celebrant_id: celebrant.id,
				celebrant_title: celebrant.celebrant_title,
				celebrant_name: celebrant.religious_name,
				status: "scheduled",
			})

			// Marquer cette date comme utilisée par ce célébrant
			if (!usedCelebrantsByDate[dateStr]) {
				usedCelebrantsByDate[dateStr] = new Set()
			}
			usedCelebrantsByDate[dateStr].add(parseInt(celebrant_id))
		}

		return assignedMasses
	},

	/**
	 * Trouve un célébrant qui peut assurer une série de jours consécutifs
	 */
	findCelebrantForConsecutiveDates: async (daysNeeded, usedCelebrantsByDate) => {
		const today = new Date()
		const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10)
		const searchStart = new Date(today.getFullYear(), today.getMonth() + offset, 1)
		searchStart.setHours(12, 0, 0, 0)

		const maxSearchDays = 100

		const celebrantsSorted = await Celebrant.getCelebrantsSortedByBusyForMonth(searchStart)

		for (let dayOffset = 0; dayOffset <= maxSearchDays; dayOffset++) {
			const startDate = new Date(searchStart)
			startDate.setDate(searchStart.getDate() + dayOffset)

			for (const celebrant of celebrantsSorted) {
				let canDoAllDays = true

				for (let offset = 0; offset < daysNeeded; offset++) {
					const checkDate = new Date(startDate)
					checkDate.setDate(startDate.getDate() + offset)

					const dateStr = checkDate.toISOString().split("T")[0]
					const isAvailable = await Mass.isCelebrantAvailable(celebrant.id, dateStr)
					const notAlreadyUsed = !usedCelebrantsByDate[dateStr] || !usedCelebrantsByDate[dateStr].has(celebrant.id)

					if (!isAvailable || !notAlreadyUsed) {
						canDoAllDays = false
						break
					}
				}

				if (canDoAllDays) {
					return {
						celebrant: {
							id: celebrant.id,
							celebrant_title: celebrant.celebrant_title,
							religious_name: celebrant.religious_name,
						},
						startDate,
					}
				}
			}
		}

		return null // Aucun créneau trouvé
	},

	/**
	 * Assigne des dates consécutives pour une neuvaine/trentain sans célébrant spécifique
	 */
	assignNeuvaineOrTrentainWithoutSpecificCelebrant: async (masses, intention_text, deceased, usedCelebrantsByDate, massCount) => {
		// Trouver un célébrant qui peut assurer toute la période
		const assignment = await MassService.findCelebrantForConsecutiveDates(massCount, usedCelebrantsByDate)

		if (!assignment) {
			console.error(`Aucun célébrant disponible pour ${massCount} jours consécutifs`)
			return null
		}

		const { celebrant, startDate } = assignment
		const assignedMasses = []

		// Créer les données d'assignation pour chaque jour consécutif
		for (let i = 0; i < massCount; i++) {
			const date = new Date(startDate)
			date.setDate(date.getDate() + i)
			const dateStr = date.toISOString().split("T")[0]

			assignedMasses.push({
				date: dateStr,
				intention: intention_text,
				deceased,
				celebrant_id: celebrant.id,
				celebrant_title: celebrant.celebrant_title,
				celebrant_name: celebrant.religious_name,
				status: "scheduled",
			})

			// Marquer cette date comme utilisée par ce célébrant
			if (!usedCelebrantsByDate[dateStr]) {
				usedCelebrantsByDate[dateStr] = new Set()
			}
			usedCelebrantsByDate[dateStr].add(parseInt(celebrant.id))
		}

		return assignedMasses
	},

	/**
	 * Assigne des dates consécutives aux messes de neuvaine/trentain déjà créées
	 * avec des dates indifférentes
	 */
	assignNeuvaineOrTrentain: async (intentions) => {
		const allUpdatedMasses = []
		const usedCelebrantsByDate = {}

		for (const intention of intentions) {
			const { id: intention_id, intention_text, deceased, intention_type } = intention

			// Récupérer toutes les messes non programmées pour cette intention
			const masses = await Mass.findUnscheduledMassesByIntention(intention_id)

			if (masses.length === 0) {
				console.log(`Aucune messe non programmée trouvée pour l'intention ${intention_id}`)
				continue
			}

			const massCount = masses.length
			const isNovena = intention_type === "novena"
			const isTrentain = intention_type === "thirty"

			console.log(`Traitement de ${massCount} messes pour ${isNovena ? "neuvaine" : "trentain"} - intention ${intention_id}`)

			// Déterminer si toutes les messes ont le même célébrant ou non
			const celebrantIds = [...new Set(masses.map((m) => m.celebrant_id).filter((id) => id !== null))]
			const hasSpecificCelebrant = celebrantIds.length === 1 && masses.every((m) => m.celebrant_id === celebrantIds[0])

			let assignmentResult

			if (hasSpecificCelebrant) {
				// Cas : toutes les messes ont le même célébrant spécifique
				assignmentResult = await MassService.assignNeuvaineOrTrentainWithSpecificCelebrant(
					masses,
					celebrantIds[0],
					intention_text,
					deceased,
					usedCelebrantsByDate,
					massCount
				)
			} else {
				// Cas : messes avec célébrants indifférents
				assignmentResult = await MassService.assignNeuvaineOrTrentainWithoutSpecificCelebrant(
					masses,
					intention_text,
					deceased,
					usedCelebrantsByDate,
					massCount
				)
			}

			if (!assignmentResult) {
				console.error(`Impossible d'assigner les dates pour l'intention ${intention_id}`)
				return null // Échec de l'assignation
			}

			// Mettre à jour toutes les messes en base
			for (let i = 0; i < masses.length; i++) {
				const mass = masses[i]
				const assignedData = assignmentResult[i]

				await Mass.update({
					id: mass.id,
					date: assignedData.date,
					celebrant_id: assignedData.celebrant_id,
					intention_id: intention_id,
					status: "scheduled",
				})

				allUpdatedMasses.push({
					...mass,
					date: assignedData.date,
					celebrant_id: assignedData.celebrant_id,
					status: "scheduled",
				})

				// Mettre à jour le suivi des célébrants utilisés
				await MassService.updateUsedCelebrants(assignedData, usedCelebrantsByDate)
			}
			// Mettre à jour le statut de l'intention
			await Intention.update(intention.id, { status: "in_progress" })
		}

		return allUpdatedMasses
	},
}

module.exports = MassService
