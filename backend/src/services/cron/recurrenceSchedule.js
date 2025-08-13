const cron = require("node-cron")
const db = require("../../../config/database")
// const Mass = require("../../models/mass.model")
// const Intention = require("../../models/intention.model")
//const { zonedTimeToUtc } = require('date-fns-tz');

// 1er janvier à minuit → messes annuelles sans limite de date ou d'occurence
cron.schedule("0 12 1 * *", async () => {
	const now = new Date()
	console.log("⏳ Job déclenché à :", now.toISOString())
	await assignAnnualMassesWithNoEnd()
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
	const nextYear = new Date().getFullYear() + 1

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

		// Créer la nouvelle messe
		const mass = await db("Masses").insert({
			date: nextDate.toISOString().split("T")[0], // format YYYY-MM-DD
			celebrant_id: lastMass.celebrant_id || null,
			intention_id: intent.intention_id,
			status: "scheduled",
			created_at: db.raw("CURRENT_TIMESTAMP"),
			updated_at: db.raw("CURRENT_TIMESTAMP"),
		})

		console.log(mass)
		console.log(`🕊️ Messe pour l'intention ${intent.intention_id} programmée le ${nextDate.toISOString().split("T")[0]}`)
	}
	console.log(`✅ ${intentionsWithRecurrence.length} intentions annuelles traitées`)
}
