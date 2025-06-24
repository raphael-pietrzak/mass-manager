const db = require("../../config/database")

const UnavailableDay = {
	getAll: async () => {
		return db.select().from("UnavailableDays")
	},

	create: async (unavailableDay) => {
		return db("UnavailableDays").insert(unavailableDay)
	},

	getById: async (id) => {
		return db.select().from("UnavailableDays").where("id", id)
	},

	getByCelebrantId: async (celebrant_id) => {
		return db.select().from("UnavailableDays").where("celebrant_id", celebrant_id)
	},

	update: async (unavailableDay) => {
		return db("UnavailableDays").where("id", unavailableDay.id).update(unavailableDay)
	},

	delete: async (id) => {
		return db("UnavailableDays").where("id", id).del()
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
