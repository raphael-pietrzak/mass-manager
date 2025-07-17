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
    .whereNull("Intentions.recurrence_id")
    .andWhere("Intentions.status", "pending")
    .leftJoin("Masses", "Masses.intention_id", "Intentions.id")
    .whereNull("Masses.date")
    .leftJoin("Donors", "Intentions.donor_id", "Donors.id")
    .select(
      "Intentions.*",
      "Donors.firstname as donor_firstname",
      "Donors.lastname as donor_lastname",
      "Donors.email as donor_email"
    )
    .orderBy("Intentions.created_at", "asc")
		.groupBy("Intentions.id"),

	deleteBeforeDate: () =>
		db("Intentions")
			.whereNull("recurrence_id")
			.whereNotIn("id", function () {
				this.select("intention_id").from("Masses").whereNotNull("intention_id")
			})
			.del()
}

module.exports = Intention
