const db = require("../../config/database") // Connexion Knex
const Mass = require("../models/mass.model")
const Intention = require("../models/intention.model")
const MassService = require("../services/mass.service")
const recurringIntentionService = require("../services/recurrence.service")

const Cron = {
	checkMassesAndIntentions: async () => {
		const today = new Date().toISOString().split("T")[0]
		const updatedMasses = []
		const updatedIntentions = []
		try {
			// 1️⃣ Récupérer toutes les messes passées non complétées
			const pastMasses = await db("Masses").where("date", "<=", today).andWhere("status", "scheduled")
			for (const mass of pastMasses) {
				await Mass.update({
					...mass,
					status: "completed",
				})
				updatedMasses.push(mass.id)
			}

			// 2️⃣ Trouver les intentions dont toutes les messes sont complétées
			const intentions = await db("Intentions").whereNot("status", "completed")

			for (const intention of intentions) {
				const massesOfIntention = await db("Masses").where("intention_id", intention.id)
				const allCompleted = massesOfIntention.length > 0 && massesOfIntention.every((m) => m.status === "completed")

				if (allCompleted) {
					await Intention.update(intention.id, { status: "completed" })
					updatedIntentions.push(intention.id)
				}
			}
			return { updatedMasses, updatedIntentions }
		} catch (err) {
			throw new Error(`Erreur lors de la vérification des messes/intention : ${err.message}`)
		}
	},

	assignAnnualMassesWithNoEnd: async () => {
		const today = new Date()
		const currentYear = today.getFullYear()
		const nextYear = currentYear + 1
		const usedCelebrantsByDate = {}

		const processedIntentions = []
		const createdMasses = []

		try {
			// 1️⃣ Récupérer toutes les intentions annuelles sans fin
			const intentionsWithRecurrence = await db("Intentions as i")
				.leftJoin("Recurrences as r", "i.recurrence_id", "r.id")
				.select("i.id as intention_id", "i.intention_text", "i.status", "r.type", "r.end_type", "r.start_date")
				.where("r.type", "yearly")
				.andWhere("r.end_type", "no-end")

			if (!intentionsWithRecurrence.length) {
				return {
					createdMasses,
					processedIntentions,
				}
			}

			for (const intent of intentionsWithRecurrence) {
				// Récupérer la dernière messe pour cette intention
				const lastMass = await db("Masses").where("intention_id", intent.intention_id).orderBy("date", "desc").first()

				if (!lastMass) {
					console.log(`⚠️ Aucune messe trouvée pour l'intention ${intent.intention_id}`)
					continue
				}

				// 2️⃣ Calculer la date pour l'année suivante
				const nextDate = new Date(`${lastMass.date}T00:00:00Z`)
				nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1)
				const nextDateStr = nextDate.toISOString().split("T")[0]

				// 3️⃣ Choisir le célébrant
				let celebrantId = lastMass.celebrant_id

				if (lastMass.random_celebrant) {
					const used = usedCelebrantsByDate[nextDateStr] || []
					const availableCelebrant = await Mass.getRandomAvailableCelebrant(nextDateStr, used)
					celebrantId = availableCelebrant.id
				}

				// 4️⃣ Créer la nouvelle messe
				const [newMassId] = await db("Masses").insert({
					date: nextDateStr,
					celebrant_id: celebrantId,
					intention_id: intent.intention_id,
					status: "scheduled",
				})

				const newMass = await db("Masses").where("id", newMassId).first()
				await MassService.updateUsedCelebrants(newMass, usedCelebrantsByDate)

				createdMasses.push({
					id: newMass.id,
					date: newMass.date,
					intention_id: intent.intention_id,
				})

				processedIntentions.push(intent.intention_id)

				console.log(`🕊️ Messe créée pour intention ${intent.intention_id} le ${nextDateStr}`)
			}

			return {
				processedIntentions,
				createdMasses,
			}
		} catch (error) {
			console.error("❌ Erreur assignAnnualMassesWithNoEnd :", error)
			throw new Error(`Erreur lors de l'assignation annuelle : ${error.message}`)
		}
	},

	assignMonthlyMassesWithNoEnd: async () => {
		const now = new Date()
		const currentMonth = now.getMonth() // 0–11
		const currentYear = now.getFullYear()
		const usedCelebrantsByDate = {}

		const processedIntentions = []
		const createdMasses = []

		try {
			// 1️⃣ Récupérer les intentions mensuelles sans fin
			const intentionsWithRecurrence = await db("Intentions as i")
				.leftJoin("Recurrences as r", "i.recurrence_id", "r.id")
				.select("i.id as intention_id", "i.intention_text", "i.status", "r.type", "r.start_date", "r.end_type")
				.where("r.type", "monthly")
				.andWhere("r.end_type", "no-end")
				.andWhereRaw("strftime('%m', r.start_date) = ?", [String(currentMonth + 1).padStart(2, "0")])

			if (!intentionsWithRecurrence.length) {
				console.log("ℹ️ Aucune intention mensuelle sans fin à traiter ce mois-ci.")
				return { createdMasses, processedIntentions }
			}

			for (const intent of intentionsWithRecurrence) {
				// 2️⃣ Récupérer la messe du mois courant
				const lastMass = await db("Masses")
					.where("intention_id", intent.intention_id)
					.andWhereRaw("strftime('%m', date) = ?", [String(currentMonth + 1).padStart(2, "0")])
					.andWhereRaw("strftime('%Y', date) = ?", [String(currentYear)])
					.first()

				if (!lastMass) {
					console.log(`⚠️ Aucune messe trouvée ce mois-ci pour l’intention ${intent.intention_id}`)
					continue
				}

				// 3️⃣ Calculer la date pour 12 mois plus tard
				const currentDate = new Date(lastMass.date)
				const nextDate = new Date(currentDate)
				nextDate.setMonth(nextDate.getMonth() + 12)

				// 4️⃣ Déterminer le célébrant
				let celebrantId = lastMass.celebrant_id

				if (lastMass.random_celebrant) {
					const used = usedCelebrantsByDate[nextDate.toISOString().split("T")[0]] || []
					const availableCelebrant = await Mass.getRandomAvailableCelebrant(nextDate.toISOString().split("T")[0], used)
					celebrantId = availableCelebrant.id
				}

				// 5️⃣ Créer la nouvelle messe
				const [newMassId] = await db("Masses").insert({
					date: nextDate.toISOString().split("T")[0],
					celebrant_id: celebrantId,
					intention_id: intent.intention_id,
					random_celebrant: lastMass.random_celebrant,
					status: "scheduled",
				})

				const newMass = await db("Masses").where("id", newMassId).first()
				await MassService.updateUsedCelebrants(newMass, usedCelebrantsByDate)

				createdMasses.push({
					id: newMass.id,
					date: newMass.date,
					intention_id: newMass.intention_id,
				})

				processedIntentions.push(intent.intention_id)

				console.log(`🕊️ Nouvelle messe programmée pour intention ${intent.intention_id} le ${nextDate.toISOString().split("T")[0]}`)
			}

			console.log(`✅ ${createdMasses.length} messes créées pour ${processedIntentions.length} intentions.`)

			return { processedIntentions, createdMasses }
		} catch (error) {
			console.error("❌ Erreur assignMonthlyMassesWithNoEnd :", error)
			throw new Error(`Erreur lors de l'assignation mensuelle : ${error.message}`)
		}
	},

	assignMonthlyRelativePositionMassesWithNoEnd: async () => {
		const now = new Date()
		const currentMonth = now.getMonth() // 0–11
		const currentYear = now.getFullYear()
		const usedCelebrantsByDate = {}

		const processedIntentions = []
		const createdMasses = []

		try {
			// 1️⃣ Récupérer les intentions mensuelles avec position relative sans fin
			const intentionsWithRecurrence = await db("Intentions as i")
				.leftJoin("Recurrences as r", "i.recurrence_id", "r.id")
				.select(
					"i.id as intention_id",
					"i.donor_id",
					"i.intention_text",
					"i.deceased",
					"i.amount",
					"i.payment_method",
					"i.recurrence_id",
					"i.status",
					"i.brother_name",
					"i.wants_celebration_date",
					"i.date_type",
					"r.id as recurrence_id",
					"r.type",
					"r.start_date",
					"r.end_type",
					"r.end_date",
					"r.occurrences",
					"r.position",
					"r.weekday"
				)
				.where("r.type", "relative_position")
				.andWhere("r.end_type", "no-end")
				.andWhereRaw("strftime('%m', r.start_date) = ?", [String(currentMonth + 1).padStart(2, "0")])

			if (!intentionsWithRecurrence.length) {
				console.log("ℹ️ Aucune intention mensuelle (position relative) sans fin à traiter ce mois-ci.")
				return { createdMasses, processedIntentions }
			}

			// 2️⃣ Pour chaque intention
			for (const intent of intentionsWithRecurrence) {
				// Récupérer la messe du mois courant pour cette intention
				const massThisMonth = await db("Masses")
					.where("intention_id", intent.intention_id)
					.andWhereRaw("strftime('%m', date) = ?", [String(currentMonth + 1).padStart(2, "0")])
					.andWhereRaw("strftime('%Y', date) = ?", [String(currentYear)])
					.first()

				if (!massThisMonth) {
					console.log(`⚠️ Aucune messe trouvée ce mois-ci pour l’intention ${intent.intention_id}`)
					continue
				}

				// 3️⃣ Calcul de la prochaine date (même position relative, mois +12)
				const massDate = new Date(massThisMonth.date)
				const startNextDate = new Date(massDate.getFullYear() + 1, massDate.getMonth(), 1)

				const nextDate = recurringIntentionService.getNextRelativePositionDate(startNextDate, intent.position, intent.weekday)

				const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(nextDate.getDate()).padStart(
					2,
					"0"
				)}`

				// 4️⃣ Déterminer le célébrant
				let celebrantId = massThisMonth.celebrant_id

				if (massThisMonth.random_celebrant) {
					const used = usedCelebrantsByDate[nextDateStr] ? Array.from(usedCelebrantsByDate[nextDateStr]) : []

					const availableCelebrant = await Mass.getRandomAvailableCelebrant(nextDateStr, used)
					celebrantId = availableCelebrant.id
				}

				// 5️⃣ Création de la nouvelle messe
				const [newMassId] = await db("Masses").insert({
					date: nextDateStr,
					celebrant_id: celebrantId,
					intention_id: intent.intention_id,
					random_celebrant: massThisMonth.random_celebrant,
					status: "scheduled",
				})

				const newMass = await db("Masses").where("id", newMassId).first()

				// 6️⃣ Mise à jour des célébrants déjà utilisés
				await MassService.updateUsedCelebrants(newMass, usedCelebrantsByDate)

				// 7️⃣ Ajout au reporting
				createdMasses.push({
					id: newMass.id,
					date: newMass.date,
					intention_id: newMass.intention_id,
				})

				processedIntentions.push(intent.intention_id)

				console.log(`🕊️ Nouvelle messe programmée pour intention ${intent.intention_id} le ${nextDateStr}`)
			}

			return { processedIntentions, createdMasses }
		} catch (error) {
			console.error("❌ Erreur assignMonthlyRelativePositionMassesWithNoEnd :", error)
			throw new Error(`Erreur lors de l'assignation mensuelle relative : ${error.message}`)
		}
	},
}

module.exports = Cron
