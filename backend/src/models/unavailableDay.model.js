const db = require("../../config/database")

const UnavailableDay = {
	getAll: async () => {
		return db
			.select({
				id: "UnavailableDays.id",
				date: "UnavailableDays.date",
				is_recurrent: "UnavailableDays.is_recurrent",
				celebrant_title: "Celebrants.title",
				celebrant_religious_name: "Celebrants.religious_name",
				// ajoute d'autres colonnes si nécessaire
			})
			.from("UnavailableDays")
			.leftJoin("Celebrants", "UnavailableDays.celebrant_id", "Celebrants.id")
	},

	create: async (unavailableDay) => {
		if (unavailableDay.is_recurrent) {
			const [yearStr, monthStr, dayStr] = unavailableDay.date.split("-")
			const day = parseInt(dayStr)
			const month = parseInt(monthStr) - 1
			const year = parseInt(yearStr)
			const pad = (n) => n.toString().padStart(2, "0")

			const rows = []

			for (let i = 0; i < 50; i++) {
				const newYear = year + i
				rows.push({
					celebrant_id: unavailableDay.celebrant_id,
					date: `${newYear}-${pad(month + 1)}-${pad(day)}`,
					is_recurrent: true,
				})
			}
			return db("UnavailableDays").insert(rows)
		} else {
			return db("UnavailableDays").insert(unavailableDay)
		}
	},

	getById: async (id) => {
		return db.select().from("UnavailableDays").where("id", id)
	},

	getByCelebrantId: async (celebrant_id) => {
		return db.select().from("UnavailableDays").where("celebrant_id", celebrant_id)
	},

	update: async (unavailableDay) => {
		if (unavailableDay.is_recurrent) {
			const baseDate = new Date(unavailableDay.date)
			const month = baseDate.getMonth() + 1
			const day = baseDate.getDate()
			const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

			// Mettre à jour tous les jours indisponibles ayant la même date (MM-DD)
			return db("SpecialDays").whereRaw("strftime('%m-%d', date) = ?", [mmdd]).andWhere("is_recurrent", true).update({
				date: unavailableDay.baseDate,
			})
		} else {
			// Mise à jour normale
			return db("UnavailableDays").where("id", unavailableDay.id).update(unavailableDay)
		}
	},

	delete: async (id) => {
		const row = await db("UnavailableDays").where("id", id).first()
		if (!row) return 0

		if (row.is_recurrent) {
			const baseDate = new Date(row.date)
			const month = baseDate.getMonth() + 1
			const day = baseDate.getDate()

			// Supprimer toutes les occurrences avec même MM-DD
			return db("UnavailableDays")
				.whereRaw("strftime('%m-%d', date) = ?", [`${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`])
				.andWhere("is_recurrent", true)
				.andWhere("celebrant_id", row.celebrant_id)
				.del()
		} else {
			// Suppression normale
			return db("UnavailableDays").where("id", id).del()
		}
	},

	deleteBeforeDate: async (date) => {
		const formattedDate = new Date(date).toISOString().split("T")[0]
		return db("UnavailableDays")
			.where(db.raw("DATE(date) < DATE(?)", [formattedDate]))
			.where(db.raw("is_recurrent = 0"))
			.del()
	},
}

module.exports = UnavailableDay
