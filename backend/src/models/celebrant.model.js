const db = require("../../config/database")

const Celebrant = {
	getAll: async () => {
		return db.select().from("Celebrants")
	},

	create: async (celebrant) => {
		return db("Celebrants").insert(celebrant)
	},

	getById: async (id) => {
		return db.select("*", "title as celebrant_title").from("Celebrants").where("id", id).first()
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

	getCelebrantsSortedByBusyForMonth: async (startDate) => {
		const year = startDate.getFullYear()
		const month = startDate.getMonth() + 1 // JS: janvier = 0

		// Formater "YYYY-MM" pour filtrer sur le mois
		const monthPrefix = `${year}-${month.toString().padStart(2, "0")}`

		const result = await db.raw(
			`
    SELECT 
      c.id, 
      c.religious_name,
      c.title AS celebrant_title,
      COUNT(m.id) AS mass_count
    FROM 
      Celebrants c
    LEFT JOIN 
      Masses m ON c.id = m.celebrant_id AND strftime('%Y-%m', m.date) = ?
    GROUP BY 
      c.id, c.religious_name, c.title
    ORDER BY 
      mass_count ASC
    `,
			[monthPrefix]
		)
		return result || []
	},

	getFullDates: async () => {
		// Récupérer tous les célébrants pour connaître leur nombre
		const celebrants = await db("Celebrants").select("id")
		const totalCelebrants = celebrants.length

		if (totalCelebrants === 0) return []

		// Compter combien de célébrants ont une messe assignée pour chaque date
		const result = await db("Masses")
			.select(db.raw("DATE(date) as date"))
			.whereNotNull("celebrant_id")
			.groupByRaw("DATE(date)")
			.havingRaw("COUNT(DISTINCT celebrant_id) >= ?", [totalCelebrants])

		// Retourner les dates (en format ISO)
		return result.map((row) => row.date)
	},
}

module.exports = Celebrant
