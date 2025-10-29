const db = require("../../config/database")

const SpecialDay = {
	getAll: async (filters = {}) => {
		let query = db.select().from("SpecialDays")
		// Parcours les clés du filtre
		Object.entries(filters).forEach(([key, value]) => {
			// Pour une recherche simple avec égalité
			query = query.where(key, value)
		})
		return query
	},

	create: async (specialDay) => {
		if (specialDay.is_recurrent) {
			const [yearStr, monthStr, dayStr] = specialDay.date.split("-")
			const day = parseInt(dayStr)
			const month = parseInt(monthStr) - 1
			const year = parseInt(yearStr)
			const pad = (n) => n.toString().padStart(2, "0")

			const rows = []

			for (let i = 0; i < 50; i++) {
				const newYear = year + i
				rows.push({
					date: `${newYear}-${pad(month + 1)}-${pad(day)}`,
					description: specialDay.description,
					number_of_masses: specialDay.number_of_masses,
					is_recurrent: true,
				})
			}
			return db("SpecialDays").insert(rows)
		} else {
			return db("SpecialDays").insert(specialDay)
		}
	},

	getById: async (id) => {
		return db.select().from("SpecialDays").where("id", id)
	},

	update: async (specialDay) => {
		if (specialDay.is_recurrent) {
			const baseDate = new Date(specialDay.date)
			const month = baseDate.getMonth() + 1
			const day = baseDate.getDate()
			const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

			// Mettre à jour tous les jours récurrents ayant la même date (MM-DD)
			return db("SpecialDays").whereRaw("strftime('%m-%d', date) = ?", [mmdd]).andWhere("is_recurrent", true).update({
				date: specialDay.baseDate,
				description: specialDay.description,
				number_of_masses: specialDay.number_of_masses,
			})
		} else {
			// Mise à jour normale
			return db("SpecialDays").where("id", specialDay.id).update(specialDay)
		}
	},

	delete: async (id) => {
		const row = await db("SpecialDays").where("id", id).first()
		if (!row) return 0

		if (row.is_recurrent) {
			const baseDate = new Date(row.date)
			const month = baseDate.getMonth() + 1
			const day = baseDate.getDate()

			// Supprimer toutes les occurrences avec même MM-DD
			return db("SpecialDays")
				.whereRaw("strftime('%m-%d', date) = ?", [`${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`])
				.andWhere("is_recurrent", true)
				.del()
		} else {
			// Suppression normale
			return db("SpecialDays").where("id", id).del()
		}
	},

	deleteBeforeDate: async (date) => {
		return await db("SpecialDays").where("date", "<", date).andWhere("is_recurrent", 0).del()
	},
}

module.exports = SpecialDay
