const db = require("../../config/database")

class Mass {
	static async getAll() {
		const results = await db("Masses")
			.select(
				"Masses.id",
				"Masses.date",
				"Masses.random_celebrant",
				"Celebrants.religious_name as celebrant_religious_name",
				"Celebrants.id as celebrant_id",
				"Celebrants.title as celebrant_title",
				"Intentions.intention_text as intention",
				"Intentions.deceased as deceased",
				"Intentions.date_type as dateType",
				"Masses.status",
				"Intentions.deceased",
				"Intentions.amount",
				"Intentions.wants_celebration_date as wants_notification",
				"Intentions.donor_id",
				"Donors.firstname as donor_firstname",
				"Donors.lastname as donor_lastname"
			)
			.leftJoin("Celebrants", "Masses.celebrant_id", "Celebrants.id")
			.leftJoin("Intentions", "Masses.intention_id", "Intentions.id")
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id")
			.orderBy("Masses.date")

		return results
	}

	static async create(mass) {
		return db("Masses").insert(mass)
	}

	static async getById(id) {
		return db("Masses")
			.select(
				"Masses.id",
				"Masses.date",
				"Masses.celebrant_id",
				"Masses.random_celebrant",
				"Celebrants.religious_name as celebrant",
				"Masses.status",
				"Masses.intention_id",
				"Intentions.intention_text as intention",
				"Intentions.amount",
				"Intentions.wants_celebration_date as wants_notification",
				"Intentions.donor_id"
			)
			.leftJoin("Celebrants", "Masses.celebrant_id", "Celebrants.id")
			.leftJoin("Intentions", "Masses.intention_id", "Intentions.id")
			.where("Masses.id", id)
			.first()
	}

	static async update(mass) {
		return db("Masses").where("id", mass.id).update({
			date: mass.date,
			celebrant_id: mass.celebrant_id,
			intention_id: mass.intention_id,
			status: mass.status,
			random_celebrant: mass.random_celebrant,
		})
	}

	static async delete(id) {
		return db("Masses").where("id", id).del()
	}

	static async getMassesByCelebrantAndDate(celebrantId, date) {
		return db("Masses").where("celebrant_id", celebrantId).whereRaw("DATE(date) = DATE(?)", [date]).count("* as count").first()
	}

	static async isCelebrantAvailable(celebrantId, date) {
		// Convertir la date au format YYYY-MM-DD si ce n'est pas déjà fait
		const formattedDate = new Date(date).toISOString().split("T")[0]

		// Vérifier si le célébrant a déjà une messe ce jour-là
		const existingMass = await db("Masses").where("celebrant_id", celebrantId).whereRaw("DATE(date) = ?", [formattedDate]).first()

		if (existingMass) return false

		// Vérifier si le jour est marqué comme indisponible pour ce célébrant
		const unavailable = await db("UnavailableDays").where("celebrant_id", celebrantId).whereRaw("DATE(date) = ?", [formattedDate]).first()

		if (unavailable) return false

		// Vérifier si le jour est spécial avec number_of_masses = 0
		const specialDay = await db("SpecialDays").whereRaw("DATE(date) = ?", [formattedDate]).where("number_of_masses", 0).first()

		if (specialDay) return false

		return true
	}

	static async getRandomAvailableCelebrant(date, excludedCelebrantIds = []) {
		// Convertir la date au format YYYY-MM-DD
		const formattedDate = new Date(date).toISOString().split("T")[0]

		// Vérifier si la date est un jour spécial (bloqué pour toutes messes)
		const specialDay = await db("SpecialDays")
			.where(db.raw("DATE(date) = DATE(?)", [formattedDate]))
			.andWhere("number_of_masses", "=", 0)
			.first()
		if (specialDay) {
			// Si jour spécial, aucun célébrant disponible
			return null
		}

		// Trouver les célébrants déjà assignés ce jour-là
		const assignedCelebrants = await db("Masses").select("celebrant_id").whereRaw("DATE(date) = ?", [formattedDate])
		const assignedCelebrantIds = assignedCelebrants.map((c) => c.celebrant_id)

		// Trouver les célébrants indisponibles ce jour-là
		const unavailableCelebrants = await db("UnavailableDays")
			.where(db.raw("DATE(date) = DATE(?)", [formattedDate]))
			.select("celebrant_id")
		const unavailableIds = unavailableCelebrants.map((row) => row.celebrant_id)

		// Combiner les exclusions : assignés, passés en paramètre, indisponibles
		const allExcludedIds = [...new Set([...assignedCelebrantIds, ...excludedCelebrantIds, ...unavailableIds])].filter((id) => id != null)

		// Trouver un célébrant disponible qui n'est pas dans les exclusions
		const availableCelebrant = await db("Celebrants")
			.select("id", "religious_name", "title as celebrant_title")
			.whereNotIn("id", allExcludedIds)
			.orderByRaw("RANDOM()")
			.first()

		return availableCelebrant
	}

	static async findNextAvailableCelebrant(targetDate) {
		return await Mass.getRandomAvailableCelebrant(targetDate)
	}

	static async findAvailableSlotsForMultipleMasses(numberOfMasses, usedCelebrantsByDate = {}) {
		const now = new Date()
		const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10)
		const startDate = new Date(now.getFullYear(), now.getMonth() + offset, 1)
		const endDate = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
		startDate.setHours(12, 0, 0, 0)
		endDate.setHours(12, 0, 0, 0)

		const assignedSlots = []
		const usedDates = new Set() // pour pas réutiliser le même jour plusieurs fois

		for (let d = new Date(startDate); d <= endDate && assignedSlots.length < numberOfMasses; d.setDate(d.getDate() + 1)) {
			const dateToCheck = new Date(d)
			const formattedDate = dateToCheck.toISOString().split("T")[0]

			if (usedDates.has(formattedDate)) continue // pas 2 messes le même jour dans cette intention

			// Vérifier jour spécial bloqué
			const specialDay = await db("SpecialDays")
				.where(db.raw("DATE(date) = DATE(?)", [formattedDate]))
				.andWhere("number_of_masses", "=", 0)
				.first()
			if (specialDay) continue

			// Récupérer les célébrants déjà utilisés pour cette date
			const usedCelebrantsForDate = usedCelebrantsByDate[formattedDate] ? Array.from(usedCelebrantsByDate[formattedDate]) : []

			// Récupérer les célébrants indisponibles
			const unavailableCelebrants = await db("UnavailableDays")
				.where(db.raw("DATE(date) = DATE(?)", [formattedDate]))
				.select("celebrant_id")
			const unavailableIds = unavailableCelebrants.map((row) => row.celebrant_id)

			const excludedIds = [...new Set([...usedCelebrantsForDate, ...unavailableIds])]

			// Trouver un célébrant dispo ce jour
			const availableCelebrant = await Mass.getRandomAvailableCelebrant(dateToCheck, excludedIds)
			if (availableCelebrant) {
				assignedSlots.push({
					date: new Date(dateToCheck),
					celebrant: availableCelebrant,
				})
				usedDates.add(formattedDate)
			}
		}

		// Si on a pas assez de slots pour toutes les messes
		if (assignedSlots.length < numberOfMasses) return null
		return assignedSlots
	}

	static async findNextAvailableSlotForCelebrant(celebrantId, usedCelebrantsByDate = {}) {
		const now = new Date()
		const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10)
		const startDate = new Date(now.getFullYear(), now.getMonth() + offset, 1)
		startDate.setHours(12, 0, 0, 0)

		const endDate = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
		endDate.setHours(12, 0, 0, 0)

		for (let dateToCheck = new Date(startDate); dateToCheck <= endDate; dateToCheck.setDate(dateToCheck.getDate() + 1)) {
			// Formater la date pour les comparaisons
			const formattedDate = dateToCheck.toISOString().split("T")[0]

			// Vérifier s'il s'agit d'un jour spécial à exclure
			const specialDay = await db("SpecialDays")
				.where(db.raw("DATE(date) = DATE(?)", [dateToCheck]))
				.andWhere("number_of_masses", "=", 0)
				.first()

			if (specialDay) continue

			// Vérifier s'il s'agit d'un jour d'indisponibilité à exclure
			const unavailableDay = await db("UnavailableDays")
				.where("celebrant_id", celebrantId)
				.andWhere(db.raw("DATE(date) = DATE(?)", [formattedDate]))
				.first()

			if (unavailableDay) continue

			// Vérifier si ce célébrant est déjà utilisé pour cette date dans usedCelebrantsByDate
			if (usedCelebrantsByDate[formattedDate] && usedCelebrantsByDate[formattedDate].has(parseInt(celebrantId))) {
				continue
			}

			// Vérifier si le célébrant est disponible à cette date
			const isAvailable = await Mass.isCelebrantAvailable(celebrantId, formattedDate)

			if (isAvailable) {
				const celebrant = await db("Celebrants").select("id", "religious_name", "title as celebrant_title").where("id", celebrantId).first()

				return {
					date: dateToCheck,
					celebrant: celebrant,
				}
			}
		}

		// Aucun créneau disponible trouvé pour ce célébrant
		return null
	}

	static async findNextAvailableSlot(usedCelebrantsByDate = {}) {
		const now = new Date()
		const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10)
		const startDate = new Date(now.getFullYear(), now.getMonth() + offset, 1)
		startDate.setHours(12, 0, 0, 0)

		const endDate = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
		endDate.setHours(12, 0, 0, 0)

		for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
			const dateToCheck = new Date(d)
			const formattedDate = dateToCheck.toISOString().split("T")[0]
			// Exclure les jours spéciaux
			const specialDay = await db("SpecialDays")
				.where(db.raw("DATE(date) = DATE(?)", [formattedDate]))
				.first()
			if (specialDay) continue

			// Récupérer les célébrants déjà utilisés pour cette date
			const usedCelebrantsForDate = usedCelebrantsByDate[formattedDate] ? Array.from(usedCelebrantsByDate[formattedDate]) : []

			// Récupérer les célébrants indisponibles pour cette date
			const unavailableCelebrants = await db("UnavailableDays")
				.where(db.raw("DATE(date) = DATE(?)", [formattedDate]))
				.select("celebrant_id")

			const unavailableIds = unavailableCelebrants.map((row) => row.celebrant_id)

			// Exclure à la fois les déjà utilisés et les indisponibles
			const excludedIds = [...new Set([...usedCelebrantsForDate, ...unavailableIds])]

			// Trouver un célébrant dispo
			const availableCelebrant = await Mass.getRandomAvailableCelebrant(dateToCheck, excludedIds)

			if (availableCelebrant) {
				return {
					date: dateToCheck,
					celebrant: availableCelebrant,
				}
			}
		}

		return null
	}

	static async getUpcomingMonth() {
		const today = new Date()
		const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
		const endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

		return await db("Masses")
			.whereBetween("date", [startDate.toISOString(), endDate.toISOString()])
			.leftJoin("Celebrants", "Masses.celebrant_id", "Celebrants.id")
			.leftJoin("Intentions", "Masses.intention_id", "Intentions.id")
			.select(
				"Masses.*",
				"Celebrants.religious_name as celebrant_name",
				"Celebrants.title as celebrant_title",
				"Intentions.intention_text as intention",
				"Intentions.amount",
				"Intentions.wants_celebration_date as wants_notification",
				"Intentions.donor_id"
			)
			.orderBy("date")
	}

	static async getMassesByDateRange(startDate, endDate, celebrant_id, page = 1) {
		const limit = 15
		const offset = (page - 1) * limit

		// Requête principale paginée
		let query = db("Masses")
			.leftJoin("Celebrants", "Masses.celebrant_id", "Celebrants.id")
			.leftJoin("Intentions", "Masses.intention_id", "Intentions.id")
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id")
			.select(
				"Masses.id",
				"Masses.date",
				"Masses.status",
				"Masses.random_celebrant",
				"Celebrants.title as celebrant_title",
				"Celebrants.religious_name as celebrant_religious_name",
				"Celebrants.id as celebrant_id",
				"Intentions.intention_text as intention",
				"Intentions.deceased as deceased",
				"Intentions.amount",
				"Intentions.date_type as dateType",
				"Intentions.intention_type as intention_type",
				"Intentions.wants_celebration_date as wants_notification",
				"Donors.firstname as donor_firstname",
				"Donors.lastname as donor_lastname",
				"Donors.email as donor_email",
				"Intentions.recurrence_id"
			)
			.where("Masses.status", "!=", "pending")
			.orderBy("Masses.date")
			.limit(limit)
			.offset(offset)

		if (celebrant_id) {
			query = query.where("Masses.celebrant_id", celebrant_id)
		}

		if (startDate) {
			const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
			query = query.where(db.raw("DATE(Masses.date)"), ">=", formattedStartDate)
		}

		if (endDate) {
			const formattedEndDate = new Date(endDate).toISOString().split("T")[0]
			query = query.where(db.raw("DATE(Masses.date)"), "<=", formattedEndDate)
		}

		// Comptage total pour la pagination
		let countQuery = db("Masses").countDistinct("Masses.id as total").where("Masses.status", "!=", "pending")

		if (celebrant_id) {
			countQuery = countQuery.where("Masses.celebrant_id", celebrant_id)
		}

		if (startDate) {
			const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
			countQuery = countQuery.where(db.raw("DATE(Masses.date)"), ">=", formattedStartDate)
		}

		if (endDate) {
			const formattedEndDate = new Date(endDate).toISOString().split("T")[0]
			countQuery = countQuery.where(db.raw("DATE(Masses.date)"), "<=", formattedEndDate)
		}

		const [data, countResult] = await Promise.all([query, countQuery])
		const total = Number(countResult[0].total)
		const totalPages = Math.ceil(total / limit)

		return {
			data,
			pagination: {
				total,
				page,
				limit,
				totalPages,
			},
		}
	}

	static async getMassesByDateRangeToExport(startDate, endDate) {
		// Formater les dates au format YYYY-MM-DD
		const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
		const formattedEndDate = new Date(endDate).toISOString().split("T")[0]

		// Construire la requête
		const data = await db("Masses")
			.leftJoin("Celebrants", "Masses.celebrant_id", "Celebrants.id")
			.leftJoin("Intentions", "Masses.intention_id", "Intentions.id")
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id")
			.select(
				"Masses.id",
				"Masses.date",
				"Masses.status",
				"Masses.random_celebrant",
				"Celebrants.title as celebrant_title",
				"Celebrants.religious_name as celebrant_religious_name",
				"Celebrants.id as celebrant_id",
				"Intentions.intention_text as intention",
				"Intentions.deceased as deceased",
				"Intentions.amount",
				"Intentions.date_type as dateType",
				"Intentions.intention_type as intention_type",
				"Intentions.wants_celebration_date as wants_notification",
				"Donors.firstname as donor_firstname",
				"Donors.lastname as donor_lastname",
				"Donors.email as donor_email",
				"Intentions.recurrence_id"
			)
			.where("Masses.status", "!=", "pending")
			.whereRaw("DATE(Masses.date) >= ?", [formattedStartDate])
			.whereRaw("DATE(Masses.date) <= ?", [formattedEndDate])
			.orderBy("Masses.date")

		return data
	}

	static async getMassesByIntentionId(intentionId) {
		return db("Masses")
			.select(
				"Masses.id",
				"Masses.date",
				"Masses.status",
				"Masses.random_celebrant",
				"Celebrants.religious_name as celebrant_name",
				"Celebrants.title as celebrant_title",
				"Celebrants.id as celebrant_id",
				"Intentions.intention_text as intention",
				"Intentions.deceased",
				"Intentions.id as intention_id"
			)
			.leftJoin("Celebrants", "Masses.celebrant_id", "Celebrants.id")
			.leftJoin("Intentions", "Masses.intention_id", "Intentions.id")
			.where("Masses.intention_id", intentionId)
			.orderBy("Masses.date")
	}

	static async findUnscheduledMassesByIntention(intentionId) {
		return db("Masses")
			.where("intention_id", intentionId)
			.andWhere(function () {
				this.whereNull("date")
			})
	}

	/**
	 * Récupère toutes les messes d'un célébrant sur une période en une seule requête
	 * Optimisé pour vérifier les dates consécutives
	 */
	static async getMassesByCelebrantAndPeriod(celebrantId, startDate, endDate) {
		return db("Masses")
			.select(db.raw("DATE(date) as date"))
			.where("celebrant_id", celebrantId)
			.andWhere(db.raw("DATE(date)"), ">=", startDate.toISOString().split("T")[0])
			.andWhere(db.raw("DATE(date)"), "<=", endDate.toISOString().split("T")[0])
			.orderBy("date")
	}

	/**
	 * Récupère tous les jours indisponibles d'un célébrant sur une période
	 */
	static async getUnavailableDaysByCelebrantAndPeriod(celebrantId, startDate, endDate) {
		return db("UnavailableDays")
			.select(db.raw("DATE(date) as date"))
			.where("celebrant_id", celebrantId)
			.andWhere(db.raw("DATE(date)"), ">=", startDate.toISOString().split("T")[0])
			.andWhere(db.raw("DATE(date)"), "<=", endDate.toISOString().split("T")[0])
			.orderBy("date")
	}

	/**
	 * Récupère tous les jours spéciaux bloquants sur une période
	 */
	static async getBlockedSpecialDays(startDate, endDate) {
		return db("SpecialDays")
			.select(db.raw("DATE(date) as date"))
			.where("number_of_masses", 0)
			.andWhere(db.raw("DATE(date)"), ">=", startDate.toISOString().split("T")[0])
			.andWhere(db.raw("DATE(date)"), "<=", endDate.toISOString().split("T")[0])
			.orderBy("date")
	}

	/**
	 * Trouve N jours consécutifs disponibles pour un célébrant
	 * Charge toutes les données nécessaires en 3 requêtes au lieu de N*3
	 */
	static async findConsecutiveDaysForCelebrant(celebrantId, daysNeeded, usedCelebrantsByDate = {}) {
		const today = new Date()
		const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10) || 0
		const searchStart = new Date(today.getFullYear(), today.getMonth() + offset, 1)
		searchStart.setHours(12, 0, 0, 0)

		const maxSearchDays = parseInt(process.env.MAX_SEARCH_DAYS, 10) || 100
		const searchEnd = new Date(searchStart)
		searchEnd.setDate(searchEnd.getDate() + maxSearchDays)

		// 1. Récupérer toutes les données en parallèle (3 requêtes au lieu de N*3)
		const [existingMasses, unavailableDays, blockedDays] = await Promise.all([
			this.getMassesByCelebrantAndPeriod(celebrantId, searchStart, searchEnd),
			this.getUnavailableDaysByCelebrantAndPeriod(celebrantId, searchStart, searchEnd),
			this.getBlockedSpecialDays(searchStart, searchEnd),
		])

		// 2. Créer des Sets pour recherche O(1)
		const busyDates = new Set([...existingMasses.map((m) => m.date), ...unavailableDays.map((d) => d.date), ...blockedDays.map((d) => d.date)])

		// 3. Générer toutes les dates et vérifier disponibilité
		const dates = []
		for (let i = 0; i <= maxSearchDays; i++) {
			const date = new Date(searchStart)
			date.setDate(searchStart.getDate() + i)
			const dateStr = date.toISOString().split("T")[0]

			const notInUsedCelebrants = !usedCelebrantsByDate[dateStr] || !usedCelebrantsByDate[dateStr].has(parseInt(celebrantId))
			const notBusy = !busyDates.has(dateStr)

			dates.push({
				date: date,
				dateStr: dateStr,
				available: notBusy && notInUsedCelebrants,
			})
		}

		// 4. Trouver la première séquence de N jours consécutifs disponibles
		for (let i = 0; i <= dates.length - daysNeeded; i++) {
			const window = dates.slice(i, i + daysNeeded)
			if (window.every((d) => d.available)) {
				return window.map((d) => d.dateStr)
			}
		}

		return null
	}

	/**
	 * Trouve le célébrant le moins chargé ayant N jours consécutifs disponibles
	 */
	static async findCelebrantForConsecutiveDays(daysNeeded, usedCelebrantsByDate = {}, searchStart = null) {
		const today = new Date()
		const offset = parseInt(process.env.START_SEARCH_MONTH_OFFSET, 10) || 2
		const start = searchStart || new Date(today.getFullYear(), today.getMonth() + offset, 1)
		start.setHours(12, 0, 0, 0)

		const maxSearchDays = parseInt(process.env.MAX_SEARCH_DAYS, 10) || 100
		const searchEnd = new Date(start)
		searchEnd.setDate(searchEnd.getDate() + maxSearchDays)

		// 1. Récupérer les jours bloqués une seule fois
		const blockedDays = await this.getBlockedSpecialDays(start, searchEnd)
		const blockedDatesSet = new Set(blockedDays.map((d) => d.date))

		// 2. Récupérer tous les célébrants triés par charge
		const celebrants = await db("Celebrants")
			.select("Celebrants.*")
			.leftJoin("Masses", function () {
				this.on("Celebrants.id", "=", "Masses.celebrant_id").andOn(db.raw("EXTRACT(MONTH FROM Masses.date) = ?", [start.getMonth() + 1]))
			})
			.groupBy("Celebrants.id")
			.orderBy(db.raw("COUNT(Masses.id)"), "asc")

		// 3. Pour chaque célébrant, vérifier en parallèle s'il a des jours consécutifs
		for (const celebrant of celebrants) {
			const [existingMasses, unavailableDays] = await Promise.all([
				this.getMassesByCelebrantAndPeriod(celebrant.id, start, searchEnd),
				this.getUnavailableDaysByCelebrantAndPeriod(celebrant.id, start, searchEnd),
			])

			const busyDates = new Set([...existingMasses.map((m) => m.date), ...unavailableDays.map((d) => d.date), ...blockedDatesSet])

			// Générer tableau de disponibilité
			const availability = []
			for (let i = 0; i <= maxSearchDays; i++) {
				const date = new Date(start)
				date.setDate(start.getDate() + i)
				const dateStr = date.toISOString().split("T")[0]

				const notInUsed = !usedCelebrantsByDate[dateStr] || !usedCelebrantsByDate[dateStr].has(celebrant.id)
				const notBusy = !busyDates.has(dateStr)

				availability.push({
					date: date,
					dateStr: dateStr,
					available: notBusy && notInUsed,
				})
			}

			// Chercher fenêtre consécutive
			for (let i = 0; i <= availability.length - daysNeeded; i++) {
				const window = availability.slice(i, i + daysNeeded)
				if (window.every((d) => d.available)) {
					return {
						celebrant: celebrant,
						startDate: window[0].dateStr,
						dates: window.map((d) => d.dateStr),
					}
				}
			}
		}

		return null
	}

	/**
	 * Batch update pour plusieurs messes
	 * permet de mettre à jour plusieurs messes en une seule transaction
	 */
	static async batchUpdate(masses) {
		return db.transaction(async (trx) => {
			const updatePromises = masses.map((mass) =>
				trx("Masses").where("id", mass.id).update({
					date: mass.date,
					celebrant_id: mass.celebrant_id,
					intention_id: mass.intention_id,
					status: mass.status,
				})
			)
			return Promise.all(updatePromises)
		})
	}
}

module.exports = Mass
