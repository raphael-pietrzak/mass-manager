const db = require("../../config/database")

const Intention = {
	getAll: () =>
		db("Intentions")
			.select("Intentions.*", "Donors.firstname as donor_firstname", "Donors.lastname as donor_lastname", "Donors.email as donor_email")
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id"),

	findById: (id) =>
		db("Intentions")
			.where("Intentions.id", id)
			.select("Intentions.*", "Donors.firstname", "Donors.lastname", "Donors.email")
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id")
			.first(),

	findByRecurrenceId: (recurrence_id) => db("Intentions").where("Intentions.recurrence_id", recurrence_id).select("Intentions.*").first(),

	create: (intentionData) =>
		db("Intentions")
			.insert(intentionData)
			.returning("id")
			.then(([id]) => id?.id ?? id),

	update: (id, intentionData) =>
		db("Intentions")
			.where({ id })
			.update({ ...intentionData, updated_at: db.fn.now() }),

	delete: (id) => db("Intentions").where({ id }).del(),

	getPonctualIntentions: async (status, page = 1) => {
		const limit = 10
		const offset = (page - 1) * limit

		// Requête principale paginée
		const query = db("Intentions")
			.whereNull("Intentions.recurrence_id")
			.andWhere("Intentions.status", status)
			.leftJoin("Masses", "Masses.intention_id", "Intentions.id")
			.modify((query) => {
				if (status === "pending") {
					query.where((qb) => {
						qb.whereNull("Masses.date").orWhere("Masses.date", "")
					})
				}
			})
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id")
			.select("Intentions.*", "Donors.firstname as donor_firstname", "Donors.lastname as donor_lastname", "Donors.email as donor_email")
			.orderBy("Intentions.created_at", "asc")
			.groupBy("Intentions.id")
			.limit(limit)
			.offset(offset)

		// Comptage total pour la pagination
		const countQuery = db("Intentions")
			.whereNull("Intentions.recurrence_id")
			.andWhere("Intentions.status", status)
			.modify((query) => {
				if (status === "pending") {
					query.leftJoin("Masses", "Masses.intention_id", "Intentions.id")
					query.where((qb) => {
						qb.whereNull("Masses.date").orWhere("Masses.date", "")
					})
				}
			})
			.countDistinct("Intentions.id as total")
			.first()

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

	deleteBeforeDate: async (date) => {
		return await db("Intentions")
			.whereIn("id", function () {
				this.select("intentions.id")
					.from("Intentions as intentions")
					.join("Masses as masses", "masses.intention_id", "intentions.id")
					.where("masses.date", "<", date)
			})
			.whereNull("recurrence_id")
			.andWhere("status", "completed")
			.del()
	},
}

module.exports = Intention
