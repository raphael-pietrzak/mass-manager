const db = require("../../config/database")

class Mass {
	static async getAll() {
		const results = await db("Masses")
			.select(
				"Masses.id",
				"Masses.date",
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
		})
	}

	static async delete(id) {
		return db("Masses").where("id", id).del()
	}

	static async deleteBeforeDate(date) {
		const formattedDate = new Date(date).toISOString().split("T")[0]
		return db("Masses")
			.where(db.raw("DATE(date) < DATE(?)", [formattedDate]))
			.del()
	}

	static async getMassesByCelebrantAndDate(celebrantId, date) {
		return db("Masses").where("celebrant_id", celebrantId).whereRaw("DATE(date) = DATE(?)", [date]).count("* as count").first()
	}

	static async isCelebrantAvailable(celebrantId, date) {
		// Convertir la date au format YYYY-MM-DD si ce n'est pas déjà fait
		const formattedDate = new Date(date).toISOString().split("T")[0]

		// Vérifier si le célébrant a déjà une messe ce jour-là
		const existingMass = await db("Masses").where("celebrant_id", celebrantId).whereRaw("DATE(date) = ?", [formattedDate]).first()

		// Le célébrant est disponible s'il n'a pas déjà de messe ce jour-là
		return !existingMass
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

	static async findNextAvailableSlotForCelebrant(celebrantId, usedCelebrantsByDate = {}) {
		// Commencer à partir du 1er du mois suivant
		const now = new Date()
		// 1er jour du mois suivant
		const startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
		startDate.setHours(12, 0, 0, 0)

		// Dernier jour du mois suivant
		const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0)
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
		const startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
		startDate.setHours(12, 0, 0, 0)

		const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0)
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

	static async getMassesByDateRange(startDate, endDate, celebrant_id) {
		// Requête pour les messes normales
		let query = db("Masses")
			.leftJoin("Celebrants", "Masses.celebrant_id", "Celebrants.id")
			.leftJoin("Intentions", "Masses.intention_id", "Intentions.id")
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id")
			.select(
				"Masses.id",
				"Masses.date",
				"Masses.status",
				"Celebrants.title as celebrant_title",
				"Celebrants.religious_name as celebrant_religious_name",
				"Celebrants.id as celebrant_id",
				"Intentions.intention_text as intention",
				"Intentions.deceased as deceased",
				"Intentions.amount",
				"Intentions.date_type as dateType",
				"Intentions.wants_celebration_date as wants_notification",
				"Donors.firstname as donor_firstname",
				"Donors.lastname as donor_lastname",
				"Donors.email as donor_email"
			)
			.where("Masses.status", "=", "scheduled")
			.orderBy("Masses.date")

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
		return query
	}

	static async getMassesByIntentionId(intentionId) {
		return db("Masses")
			.select(
				"Masses.id",
				"Masses.date",
				"Masses.status",
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
}

module.exports = Mass
