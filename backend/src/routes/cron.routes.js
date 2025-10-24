const express = require("express")
const router = express.Router()
const cronController = require("../controllers/cron.controller")

router.patch("/updateMasses", cronController.checkMassesAndIntentions)
router.post("/assignAnnualMassesWithNoEnd", cronController.assignAnnualMassesWithNoEnd)
router.post("/assignMonthlyMassesWithNoEnd", cronController.assignMonthlyMassesWithNoEnd)
router.post("/assignMonthlyRelativePositionMassesWithNoEnd", cronController.assignMonthlyRelativePositionMassesWithNoEnd)

module.exports = router
