const cron = require("node-cron")
const db = require("../../../config/database")
const MassService = require("../mass.service")
const Mass = require("../../models/mass.model")

// toutes les minutes "* * * * *"
// tous les 1er de l'an "0 12 1 1 *"
// tous les 1ers du mois "0 12 1 * *"

// 1er janvier à midi → messes annuelles sans limite de date ou d'occurence
// on affecte la messe pour 2 an après
cron.schedule("0 12 1 1 *", async () => {
	const now = new Date()
	console.log("⏳ Job déclenché à :", now.toISOString())
	await assignAnnualMassesWithNoEnd()
})

// CRON : 1er jour de chaque mois à midi → messes mensuelles
// on affecte les messes de ce mois pour 12 mois après
//cron.schedule("* * * * *", async () => {
cron.schedule("0 12 1 * *", async () => {
	const now = new Date()
	const day = String(now.getDate()).padStart(2, "0")
	const month = String(now.getMonth() + 1).padStart(2, "0") // 0–11 → +1
	const year = now.getFullYear()
	const hours = String(now.getHours()).padStart(2, "0")
	const minutes = String(now.getMinutes()).padStart(2, "0")

	console.log(`⏳ Job mensuel déclenché le : ${day}-${month}-${year} à ${hours}:${minutes}`)
	await assignMonthlyMassesWithNoEnd()
})

// ---- LOGIQUE ----
async function assignAnnualMassesWithNoEnd() {
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
		.where("r.type", "yearly")
		.andWhere("r.end_type", "no-end")

	console.log(intentionsWithRecurrence)
	const nextYear = new Date().getFullYear() + 2

	for (const intent of intentionsWithRecurrence) {
		// Récupérer la dernière messe pour cette intention
		const lastMass = await db("Masses").where("intention_id", intent.intention_id).orderBy("date", "desc").first()
		if (!lastMass) {
			console.log(`⚠️ Aucune messe trouvée pour l'intention ${intent.intention_id}`)
			continue // passer à la prochaine intention
		}

		// Récupérer la date actuelle de la messe et la modifier pour l'année suivante
		const currentDate = new Date(lastMass.date)
		const nextDate = new Date(currentDate)
		nextDate.setFullYear(nextYear)

		let celebrantId = lastMass.celebrant_id
		const usedCelebrantsByDate = {}
		if (lastMass.random_celebrant) {
			// TODO : // si célébrant randomCelebrant === true on choisit un dispo
			const used = usedCelebrantsByDate[nextDate.toISOString().split("T")[0]]
				? Array.from(usedCelebrantsByDate[nextDate.toISOString().split("T")[0]])
				: []
			const availableCelebrant = await Mass.getRandomAvailableCelebrant(nextDate.toISOString().split("T")[0], used)
			celebrantId = availableCelebrant.id
		}

		// Créer la nouvelle messe
		const mass = await db("Masses").insert({
			date: nextDate.toISOString().split("T")[0], // format YYYY-MM-DD
			celebrant_id: celebrantId,
			intention_id: intent.intention_id,
			status: "scheduled",
		})

		// Mettre à jour les célébrants déjà utilisés
		await MassService.updateUsedCelebrants(mass, usedCelebrantsByDate)

		console.log(`🕊️ Messe pour l'intention ${intent.intention_id} programmée le ${nextDate.toISOString().split("T")[0]}`)
	}
	console.log(`✅ ${intentionsWithRecurrence.length} intentions annuelles traitées`)
}

async function assignMonthlyMassesWithNoEnd() {
	const now = new Date()
	const currentMonth = now.getMonth() // 0–11
	const currentYear = now.getFullYear()

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
		.where("r.type", "monthly")
		.andWhere("r.end_type", "no-end")
		.andWhereRaw("strftime('%m', r.start_date) = ?", [String(currentMonth + 1).padStart(2, "0")])

	console.log(intentionsWithRecurrence)

	for (const intent of intentionsWithRecurrence) {
		// Récupérer toutes les messes du mois courant pour cette intention
		const massesThisMonth = await db("Masses")
			.where("intention_id", intent.intention_id)
			.andWhereRaw("strftime('%m', date) = ?", [String(currentMonth + 1).padStart(2, "0")])
			.andWhereRaw("strftime('%Y', date) = ?", [String(currentYear)])

		const usedCelebrantsByDate = {}
		for (const mass of massesThisMonth) {
			const currentDate = new Date(mass.date)
			const nextDate = new Date(currentDate)
			nextDate.setMonth(nextDate.getMonth() + 12) // +12 mois (1 an après, même jour du mois)

			let celebrantId = mass.celebrant_id
			if (mass.random_celebrant) {
				// si célébrant randomCelebrant === true on choisit un dispo
				const used = usedCelebrantsByDate[nextDate.toISOString().split("T")[0]]
					? Array.from(usedCelebrantsByDate[nextDate.toISOString().split("T")[0]])
					: []
				const availableCelebrant = await Mass.getRandomAvailableCelebrant(nextDate.toISOString().split("T")[0], used)
				celebrantId = availableCelebrant.id
			}

			const newMass = await db("Masses").insert({
				date: nextDate.toISOString().split("T")[0],
				celebrant_id: celebrantId,
				intention_id: intent.intention_id,
				random_celebrant: mass.random_celebrant,
				status: "scheduled",
			})

			const massToUpdate = await db("Masses").where("id", newMass[0])

			// Mettre à jour les célébrants déjà utilisés
			await MassService.updateUsedCelebrants(massToUpdate[0], usedCelebrantsByDate)

			console.log(`🕊️ Nouvelle messe programmée pour intention ${intent.intention_id} le ${nextDate.toISOString().split("T")[0]}`)
		}
	}

	console.log("✅ Tâche assignMonthlyMassesWithNoEnd terminée.")
}

async function assignRelativePositionMassesWithNoEnd() {}
