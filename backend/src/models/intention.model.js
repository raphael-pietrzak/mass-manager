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

	getPonctualIntentions: () =>
		db("Intentions")
			.where("date_type", "indifferente")
			.whereNull("recurrence_id")
			.select("Intentions.*", "Donors.firstname as donor_firstname", "Donors.lastname as donor_lastname", "Donors.email as donor_email")
			.orderBy("created_at", "asc")
			.leftJoin("Donors", "Intentions.donor_id", "Donors.id"),
}

module.exports = Intention
