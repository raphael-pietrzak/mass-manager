import cron from "node-cron";
import axios from "axios";

// toutes les 30s ==> "*/30 * * * * *"
// toutes les minutes "* * * * *"
// tous les jours ==> "0 0 * * *"
// tous les 1er de l'an "0 12 1 1 *"
// tous les 1ers du mois "0 12 1 * *"

// Marquer les messes et intentions terminées en completed
// Vérification effectuée tous les dimanche à minuit
cron.schedule("0 0 0 * * 0", async () => {
	axios.patch("http://localhost:3001/api/cron/updateMasses")
})


// 1er janvier à midi → messes annuelles sans limite de date ou d'occurence
// on affecte la messe pour l'année suivante
cron.schedule("0 12 1 1 *", async () => {
  axios.post("http://localhost:3001/api/cron/assignAnnualMassesWithNoEnd")
})

// CRON : 1er jour de chaque mois à midi → messes mensuelles
// on affecte les messes de ce mois pour 12 mois après
cron.schedule("0 12 1 * *", async () => {
  axios.post("http://localhost:3001/api/cron/assignMonthlyMassesWithNoEnd")
  axios.post("http://localhost:3001/api/cron/assignMonthlyRelativePositionMassesWithNoEnd")
})
