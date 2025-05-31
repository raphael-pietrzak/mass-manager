const db = require("../../config/database")

const Recurrence = {
	getAll: async () => {
		return db.select().from("Recurrences")
	},

	create: async (recurrence) => {
		return db("Recurrences").insert(recurrence).returning('id')
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
		const currentDate = new Date().toISOString().split('T')[0]
		return db.select().from("Recurrences")
			.where(function() {
				this.where("end_type", "date").andWhere("end_date", ">=", currentDate)
			})
			.orWhere("end_type", "occurrences")
	},

	getRecurrencesByDateRange: async (startDate, endDate) => {
		return db.select().from("Recurrences")
			.where("start_date", "<=", endDate)
			.andWhere(function() {
				this.where("end_type", "date").andWhere("end_date", ">=", startDate)
			})
			.orWhere("end_type", "occurrences")
	}
}

module.exports = Recurrence
