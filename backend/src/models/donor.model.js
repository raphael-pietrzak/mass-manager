// models/Donor.js
const db = require("../../config/database") // Connexion Knex

const Donor = {
	getAll: async () => {
		return db.select().from("Donors").orderBy("lastname", "asc")
	},

	create: async (donor) => {
		const [id] = await db("Donors").insert(donor).returning("id")
		return id?.id ?? id
	},

	getById: async (id) => {
		return db.select().from("Donors").where("id", id)
	},

	update: async (id, donor) => {
		return db("Donors").where("id", id).update(donor)
	},

	delete: async (id) => {
		return db("Donors").where("id", id).del()
	},

	deleteBeforeDate: async (date) => {
		return db("Donors")
			.whereNotExists(function () {
				// Donateurs qui ont des intentions non terminées
				this.select("Masses.intention_id")
					.from("Masses")
					.join("Intentions", "Intentions.id", "Masses.intention_id")
					.whereRaw("Intentions.donor_id = Donors.id")
					.whereNot("Intentions.status", "completed")
			})
			.whereNotExists(function () {
				// Donateurs ayant une intention complétée liée à une messe après la date donnée
				this.select("Masses.intention_id")
					.from("Masses")
					.join("Intentions", "Intentions.id", "Masses.intention_id")
					.whereRaw("Intentions.donor_id = Donors.id")
					.where("Intentions.status", "completed")
					.andWhere("Masses.date", ">=", date)
			})
			.del()
	},

	findByEmail: async (email) => {
		return db.select().from("Donors").where("email", email).first()
	},
}

module.exports = Donor
