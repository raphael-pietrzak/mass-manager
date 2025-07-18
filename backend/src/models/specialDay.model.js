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
		return db("SpecialDays").insert(specialDay)
	},

	getById: async (id) => {
		return db.select().from("SpecialDays").where("id", id)
	},

	update: async (specialDay) => {
		return db("SpecialDays").where("id", specialDay.id).update(specialDay)
	},

	delete: async (id) => {
		return db("SpecialDays").where("id", id).del()
	},

	deleteBeforeDate: async (date) => {
		const formattedDate = new Date(date).toISOString().split("T")[0]
		return db("SpecialDays")
			.where(db.raw("DATE(date) < DATE(?)", [formattedDate]))
			.where(db.raw("is_recurrent = 0"))
			.del()
	},
}

module.exports = SpecialDay
