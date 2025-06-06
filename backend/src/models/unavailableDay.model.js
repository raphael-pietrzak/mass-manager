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
}

module.exports = UnavailableDay;
