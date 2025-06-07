const bcrypt = require("bcrypt")

exports.seed = function (knex) {
	// Supprimer les entrées existantes
	return knex("Masses")
		.del()
		.then(function () {
			return knex("Intentions").del()
		})
		.then(function () {
			return knex("Recurrences").del()
		})
		.then(function () {
			return knex("SpecialDays").del()
		})
		.then(function () {
			return knex("Donors").del()
		})
		.then(function () {
			return knex("Celebrants").del()
		})
		.then(function () {
			return knex("Users").del()
		})
		.then(function () {
			return knex("UnavailableDays").del()
		})
		.then(function () {
			// Réinitialiser les séquences d'auto-incrémentation
			return knex.raw(
				"DELETE FROM sqlite_sequence WHERE name IN ('Masses', 'SpecialDays', 'Donors', 'Celebrants', 'Users', 'Intentions', 'Recurrences', 'UnavailableDays')"
			)
		})
		.then(function () {
			// Insérer des données fictives dans les tables
			return knex("Donors").insert([
				{
					firstname: "Jean-Michel",
					lastname: "Dupont de la Tour du jardin",
					email: "jean.dupont@example.com",
					phone: "0123456789",
					address: "1 rue de Paris",
					city: "Paris",
					zip_code: "75001",
				},
				{
					firstname: "Marie",
					lastname: "Curie",
					email: "marie.curie@example.com",
					phone: "9876543210",
					address: "2 rue de Lyon",
					city: "Lyon",
					zip_code: "69002",
				},
				{
					firstname: "John",
					lastname: "Doe",
					email: "john.doet@example.com",
					phone: "0123456789",
					address: "1 rue de Paris",
					city: "Paris",
					zip_code: "75001",
				},
				{ firstname: "Jane", lastname: "Smith", email: "janesmith@example.com", address: "1 rue de Paris", city: "Lyon", zip_code: "69001" },
				{ firstname: "Alice", lastname: "Johnson", phone: "0123456789", address: "1 rue de Paris", city: "Marseille", zip_code: "13001" },
				{
					firstname: "Bob",
					lastname: "Brown",
					email: "bob.brown@example.com",
					phone: "0123456789",
					address: "1 rue de Paris",
					city: "Nice",
					zip_code: "06000",
				},
				{
					firstname: "Jacques",
					lastname: "Michel",
					email: "jaques.michelexample.com",
					phone: "0123456789",
					address: "1 rue de Paris",
					city: "Montpellier",
					zip_code: "34000",
				},
			])
		})
		.then(function () {
			return knex("Celebrants").insert([
				{
					religious_name: "Emmanuel",
					civil_firstname: "Marc",
					civil_lastname: "Lefébure",
					title: "TRP",
					role: null,
					email: "pere.abbe@lagrasse.org",
				},
				{
					religious_name: "Dominique",
					civil_firstname: "Pierre",
					civil_lastname: "Laparra",
					title: "RP",
					role: "Prieur",
					email: "peredominique@lagrasse.org",
				},
				{
					religious_name: "Maximilien",
					civil_firstname: "Alban",
					civil_lastname: "Lefébure",
					title: "RP",
					role: "Maître des écoles",
					email: "pmaximilien@lagrasse.org",
				},
				{
					religious_name: "Michel",
					civil_firstname: "Matthieu",
					civil_lastname: "Leclère",
					title: "RP",
					role: "Prieur de Pau",
					email: "pmichel@lagrasse.org",
				},
				{
					religious_name: "Hilaire",
					civil_firstname: "Barthélémy",
					civil_lastname: "Leclère",
					title: "P",
					role: "Maître des Novices",
					email: "pere.h@lagrasse.org",
				},
				{
					religious_name: "Serge",
					civil_firstname: "Jean-François",
					civil_lastname: "Valeur",
					title: "P",
					role: null,
					email: "p.serge@lagrasse.org",
				},
				{
					religious_name: "Philippe",
					civil_firstname: "Hubert",
					civil_lastname: "de La Tullaye",
					title: "P",
					role: null,
					email: "pphilippe@lagrasse.org",
				},
				{
					religious_name: "Gabriel",
					civil_firstname: "Jean-Marie",
					civil_lastname: "Lesueur",
					title: "P",
					role: null,
					email: "pgabriel@lagrasse.org",
				},
				{
					religious_name: "Jean-Baptiste",
					civil_firstname: "Guillaume",
					civil_lastname: "Golfier",
					title: "P",
					role: null,
					email: "p.jean-baptiste@lagrasse.org",
				},
				{ religious_name: "Théophane", civil_firstname: "Christophe", civil_lastname: "de Villoutreys", title: "P", role: null },
				{
					religious_name: "Louis-Marie",
					civil_firstname: "Jean-René",
					civil_lastname: "Hingant",
					title: "P",
					role: null,
					email: "p.louis-marie@lagrasse.org",
				},
				{ religious_name: "Jean", civil_firstname: "Alain", civil_lastname: "Leschenne", title: "P", role: null },
				{
					religious_name: "Ambroise",
					civil_firstname: "Augustin",
					civil_lastname: "Debut",
					title: "P",
					role: null,
					email: "26avril2014@lagrasse.org",
				},
				{
					religious_name: "Raphaël",
					civil_firstname: "Matthieu",
					civil_lastname: "Carmignac",
					title: "P",
					role: "Sous-Prieur",
					email: "p.raphael@lagrasse.org",
				},
				{ religious_name: "André", civil_firstname: "Tristan", civil_lastname: "Soullier", title: "P", role: null, email: "p.andre@lagrasse.org" },
				{ religious_name: "Luc", civil_firstname: "Robert-Emmanuel", civil_lastname: "Turquais", title: "P", role: null },
				{ religious_name: "Martin", civil_firstname: "Armand", civil_lastname: "Jozeau", title: "P", role: null, email: "fmartin@lagrasse.org" },
				{
					religious_name: "Benoît",
					civil_firstname: "Pierre",
					civil_lastname: "de Saint-Albin",
					title: "P",
					role: null,
					email: "pbenoit@lagrasse.org",
				},
				{ religious_name: "Etienne", civil_firstname: "Raphaël", civil_lastname: "Noël", title: "P", role: null },
				{
					religious_name: "Côme",
					civil_firstname: "Hugues Kabis",
					civil_lastname: "de Saint-Chamas",
					title: "P",
					role: null,
					email: "fcome@lagrasse.org",
				},
				{ religious_name: "Grégoire", civil_firstname: "Étienne", civil_lastname: "Kieffer", title: "P", role: null },
				{ religious_name: "Xavier", civil_firstname: "Jean-Luc", civil_lastname: "Davesne", title: "P", role: null, email: "pxavier@lagrasse.org" },
				{
					religious_name: "Lazare",
					civil_firstname: "Kevin",
					civil_lastname: "Libermann",
					title: "P",
					role: null,
					email: "pater.lazarus@lagrasse.org",
				},
			])
		})

		.then(function () {
			// Insérer des récurrences
			return knex("Recurrences").insert([
				{ type: "daily", start_date: "2025-01-01", end_type: "occurrences", occurrences: 30 },
				{ type: "weekly", start_date: "2025-02-01", end_type: "date", end_date: "2025-12-31" },
				{ type: "monthly", start_date: "2025-03-01", end_type: "occurrences", occurrences: 12 },
				{ type: "relative_position", start_date: "2025-01-01", end_type: "date", end_date: "2025-12-31", position: "second", weekday: "friday" }, // 2ème vendredi du mois
				{ type: "relative_position", start_date: "2025-01-01", end_type: "occurrences", occurrences: 6, position: "first", weekday: "sunday" }, // 1er dimanche du mois
			])
		})
		.then(function () {
			// Créer des données pour la table Intentions
			return knex("Intentions").insert([
				{
					donor_id: 1,
					intention_text: "Messe quotidienne pour les défunts",
					deceased: true,
					amount: 100,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "indifferente",
					recurrence_id: 1,
				},
				{
					donor_id: 2,
					intention_text: "Messe hebdomadaire pour les malades",
					deceased: false,
					amount: 20,
					payment_method: "cheque",
					wants_celebration_date: true,
					date_type: "indifferente",
					recurrence_id: 2,
				},
				{
					donor_id: 3,
					intention_text: "Messe mensuelle pour la famille",
					deceased: false,
					amount: 30,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					recurrence_id: 3,
				},
				{
					donor_id: 4,
					intention_text: "Messe le 2ème vendredi du mois",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					recurrence_id: 4,
				},
				{
					donor_id: 5,
					intention_text: "Messe le 1er dimanche du mois",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					recurrence_id: 5,
				},
				{
					donor_id: 1,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 100,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 2,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 20,
					payment_method: "cheque",
					wants_celebration_date: true,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 3,
					intention_text: "Messe pour les vivants",
					deceased: false,
					amount: 30,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 4,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 5,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 6,
					intention_text: "Messe pour les vivants",
					deceased: false,
					amount: 40,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 1,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 2,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 3,
					intention_text: "Messe pour les vivants",
					deceased: false,
					amount: 40,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 4,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 5,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 6,
					intention_text: "Messe pour les vivants",
					deceased: false,
					amount: 40,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 1,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 2,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 3,
					intention_text: "Messe pour les vivants",
					deceased: false,
					amount: 40,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 4,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 5,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 6,
					intention_text: "Messe pour les vivants",
					deceased: false,
					amount: 40,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 1,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 2,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 3,
					intention_text: "Messe pour les vivants",
					deceased: false,
					amount: 40,
					payment_method: "transfer",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 4,
					intention_text: "Messe pour les défunts",
					deceased: true,
					amount: 25,
					payment_method: "cash",
					wants_celebration_date: true,
					date_type: "specifique",
					intention_type: "unit",
					number_of_masses: 1,
				},
				{
					donor_id: 5,
					intention_text: "Messe pour les malades",
					deceased: false,
					amount: 45,
					payment_method: "cheque",
					wants_celebration_date: false,
					date_type: "indifferente",
					intention_type: "novena",
					number_of_masses: 1,
				},
			])
		})
		.then(function () {
			// Mise à jour de l'insertion dans Masses pour utiliser intention_id
			return knex("Masses").insert([
				{ date: "2025-07-20", celebrant_id: 1, intention_id: 6, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 2, intention_id: 6, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 3, intention_id: 6, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 4, intention_id: 6, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 5, intention_id: 6, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 6, intention_id: 6, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 7, intention_id: 7, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 8, intention_id: 8, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 9, intention_id: 9, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 10, intention_id: 10, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 11, intention_id: 11, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 12, intention_id: 12, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 13, intention_id: 13, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 14, intention_id: 14, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 15, intention_id: 15, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 16, intention_id: 16, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 17, intention_id: 17, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 18, intention_id: 18, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 19, intention_id: 19, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 20, intention_id: 20, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 21, intention_id: 21, status: "scheduled" },
        { date: "2025-07-20", celebrant_id: 22, intention_id: 22, status: "scheduled" },
				{ date: "2025-07-20", celebrant_id: 23, intention_id: 23, status: "scheduled" },
			])
		})
		.then(function () {
			return knex("SpecialDays").insert([
				{ date: "2024-12-25", description: "Noël", number_of_masses: 3, is_recurrent: true },
				{ date: "2025-04-17", description: "Jeudi Saint", number_of_masses: 0, is_recurrent: false },
			])
		})
		.then(function () {
			return knex("Users").insert([
				{ login_name: "admin", password: bcrypt.hashSync("admin", 10), email: "secretariat@lagrasse.org", role: "admin" },
				{ login_name: "secretariat", password: bcrypt.hashSync("Lagrasse123", 10), email: "secretariat@lagrasse.org", role: "secretary" },
			])
		})
		.then(function () {
			return knex("UnavailableDays").insert([
				{ celebrant_id: 1, date: "2025-07-27", is_recurrent: false },
				{ celebrant_id: 1, date: "2025-07-28", is_recurrent: false },
				{ celebrant_id: 2, date: "2025-01-30", is_recurrent: true },
			])
		})
}
