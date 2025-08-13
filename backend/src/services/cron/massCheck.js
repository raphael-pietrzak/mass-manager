const cron = require("node-cron")
const db = require("../../../config/database")
const Mass = require("../../models/mass.model")
const Intention = require("../../models/intention.model")

// Marquer les messes et intentions terminées en completed
// Vérification effectuée tous ls jours
cron.schedule("0 0 * * *", async () => {
	const today = new Date().toISOString().split("T")[0]
	console.log("Vérification des messes le", today)
	try {
		// 1️⃣ Récupérer toutes les messes passées non complétées
		const pastMasses = await db("Masses").where("date", "<=", today).andWhere("status", "scheduled")
		console.log(pastMasses)
		for (const mass of pastMasses) {
			await Mass.update({
				...mass,
				status: "completed",
			})
			console.log(`Messe ${mass.id} marquée comme complétée`)
		}

		// 2️⃣ Trouver les intentions dont toutes les messes sont complétées
		const intentions = await db("Intentions").whereNot("status", "completed")

		for (const intention of intentions) {
			const massesOfIntention = await db("Masses").where("intention_id", intention.id)
			const allCompleted = massesOfIntention.length > 0 && massesOfIntention.every((m) => m.status === "completed")

			if (allCompleted) {
				await Intention.update(intention.id, { status: "completed" })
				console.log(`Intention ${intention.id} marquée comme complétée`)
			}
		}
	} catch (err) {
		console.error("Erreur lors de la vérification des messes/intention :", err)
	}
})
