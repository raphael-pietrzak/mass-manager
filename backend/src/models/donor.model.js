// models/Donor.js
const db = require("../../config/database") // Connexion Knex

const Donor = {
	getAll: async () => {
		return db.select().from("Donors").orderBy("lastname", "asc")
	},

	getPaginated: async (limit, offset) => {
		return db.select().from("Donors").orderBy("lastname", "asc").limit(limit).offset(offset)
	},

	getBySearch: async (searchQuery) => {
		return db("Donors")
			.where(function () {
				this.where("lastname", "like", `%${searchQuery.toLowerCase()}%`).orWhere("email", "like", `%${searchQuery.toLowerCase()}%`)
			})
			.orderBy("lastname", "asc")
	},

	getCountBySearch: async (searchQuery) => {
		try {
			// Utiliser Knex pour compter le nombre de donateurs correspondant à la recherche
			const countResult = await db("Donors")
				.where(function () {
					this.where("lastname", "like", `%${searchQuery.toLowerCase()}%`).orWhere("email", "like", `%${searchQuery.toLowerCase()}%`)
				})
				.count("* as count") // Utiliser `count(*)` pour compter les résultats

			// Retourner le nombre de résultats
			return countResult[0].count
		} catch (error) {
			console.error("Erreur lors du comptage des donateurs par recherche:", error)
			throw error
		}
	},

	getCount: async () => {
		const result = await db("Donors").count("id as count").first()
		return parseInt(result.count, 10)
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

	// Nouvelle fonction pour trouver un donateur par email
	findByEmail: async (email) => {
		return db.select().from("Donors").where("email", email).first()
	},

	// Nouvelle fonction pour trouver un donateur par nom et prénom
	findByName: async (firstname, lastname) => {
		return db
			.select()
			.from("Donors")
			.where({
				firstname: firstname,
				lastname: lastname,
			})
			.first()
	},
}

module.exports = Donor
