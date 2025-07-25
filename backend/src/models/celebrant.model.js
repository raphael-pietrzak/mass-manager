const db = require("../../config/database")

const Celebrant = {
	getAll: async () => {
		return db.select().from("Celebrants")
	},

	create: async (celebrant) => {
		return db("Celebrants").insert(celebrant)
	},

	getById: async (id) => {
		return db.select().from("Celebrants").where("id", id)
	},

	update: async (celebrant) => {
		return db("Celebrants").where("id", celebrant.id).update(celebrant)
	},

	delete: async (id) => {
		return db("Celebrants").where("id", id).del()
	},

	getAvailableByDate: async (date) => {
		return db("Celebrants").whereNotIn("id", function () {
			this.select("celebrant_id").from("Masses").whereRaw("DATE(date) = ?", [date]).whereNotNull("celebrant_id")
		})
	},

	getUnavailableDates: async (id) => {
		return db
			.select("date")
			.from(function () {
				this.select("m.date")
					.from("Masses as m")
					.where("m.celebrant_id", id)
					.andWhere("m.date", ">=", db.raw("DATETIME('now')"))
					.union([db.select("u.date").from("UnavailableDays as u").where("u.celebrant_id", id).andWhere("u.date", ">=", db.raw("DATETIME('now')"))])
					.as("all_dates")
			})
			.orderBy("date", "asc")
			.then((rows) => {
				return rows.map((row) => row.date)
			})
	},

	getMassCountForMonth: async (celebrantId, year, month) => {
		const start = `${year}-${String(month).padStart(2, "0")}-01`
		const endDate = new Date(year, month, 0).toISOString().split("T")[0] // dernier jour du mois

		const result = await db("Masses")
			.where("celebrant_id", celebrantId)
			.andWhere("date", ">=", start)
			.andWhere("date", "<=", endDate)
			.count("id as count")
			.first()

		return parseInt(result.count || 0)
	},
}

module.exports = Celebrant
