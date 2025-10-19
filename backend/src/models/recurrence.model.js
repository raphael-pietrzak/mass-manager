const db = require("../../config/database")

const Recurrence = {
	getAll: async (page = 1) => {
		const limit = 10
		const offset = (page - 1) * limit

		// Requête principale paginée
		const query = db
			.select("r.*", "i.*", "d.firstname as donor_firstname", "d.lastname as donor_lastname", "d.email as donor_email")
			.from("Recurrences as r")
			.leftJoin("Intentions as i", "r.id", "i.recurrence_id")
			.leftJoin("Donors as d", "i.donor_id", "d.id")
			.orderBy("r.created_at", "asc")
			.limit(limit)
			.offset(offset)

		const countQuery = db("Recurrences as r").leftJoin("Intentions as i", "r.id", "i.recurrence_id").countDistinct("r.id as total").first()

		const [data, countResult] = await Promise.all([query, countQuery])
		const total = Number(countResult.total)
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
	},

	create: async (recurrence) => {
		return db("Recurrences").insert(recurrence).returning("id")
	},

	getById: async (id) => {
		return db.select().from("Recurrences").where("id", id).first()
	},

	update: async (recurrence) => {
		return db("Recurrences").where("id", recurrence.id).update(recurrence)
	},

	delete: async (id) => {
		return db("Recurrences").where("id", id).del()
	},

	getByType: async (type) => {
		return db.select().from("Recurrences").where("type", type)
	},

	getActiveRecurrences: async () => {
		const currentDate = new Date().toISOString().split("T")[0]
		return db
			.select()
			.from("Recurrences")
			.where(function () {
				this.where("end_type", "date").andWhere("end_date", ">=", currentDate)
			})
			.orWhere("end_type", "occurrences")
	},

	getRecurrencesByDateRange: async (startDate, endDate) => {
		return db
			.select()
			.from("Recurrences")
			.where("start_date", "<=", endDate)
			.andWhere(function () {
				this.where("end_type", "date").andWhere("end_date", ">=", startDate)
			})
			.orWhere("end_type", "occurrences")
	},
}

module.exports = Recurrence
