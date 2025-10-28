const MassService = require("../services/mass.service")
const Mass = require("../models/mass.model")
const Intention = require("../models/intention.model")
const Celebrant = require("../models/celebrant.model")

jest.mock("../models/mass.model")
jest.mock("../models/intention.model")
jest.mock("../models/celebrant.model")

describe("MassService.assignToExistingMasses", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test("Assigne des messes existantes avec célébrant spécifique disponible", async () => {
		const intention = { id: 1, intention_text: "Pour la paix", deceased: false }
		const mass = { id: 101, celebrant_id: 2, intention_id: null }
		const assignedMass = { date: "2025-11-01", celebrant_id: 2, status: "scheduled" }

		Mass.findUnscheduledMassesByIntention.mockResolvedValue([mass])
		MassService.handleIndifferentDateWithCelebrantForPonctualIntentions = jest.fn().mockResolvedValue(assignedMass)
		Mass.update.mockResolvedValue(true)
		Intention.update.mockResolvedValue(true)

		const result = await MassService.assignToExistingMasses([intention])
		expect(result).toHaveLength(1)
		expect(result[0].date).toBe("2025-11-01")
		expect(MassService.handleIndifferentDateWithCelebrantForPonctualIntentions).toHaveBeenCalledWith(
			2,
			intention.intention_text,
			intention.deceased,
			expect.any(Object)
		)
	})

	test("Assigne des messes existantes sans célébrant et avec disponibilité", async () => {
		const intention = { id: 2, intention_text: "Pour les malades", deceased: false }
		const mass = { id: 102, celebrant_id: null, intention_id: null }
		const assignedMass = { date: "2025-11-02", celebrant_id: 3, status: "scheduled" }

		Mass.findUnscheduledMassesByIntention.mockResolvedValue([mass])
		MassService.handleIndifferentDateWithoutCelebrantForPonctualIntention = jest.fn().mockResolvedValue(assignedMass)
		Mass.update.mockResolvedValue(true)
		Intention.update.mockResolvedValue(true)

		const result = await MassService.assignToExistingMasses([intention])
		expect(result).toHaveLength(1)
		expect(result[0].celebrant_id).toBe(3)
		expect(MassService.handleIndifferentDateWithoutCelebrantForPonctualIntention).toHaveBeenCalledWith(
			intention.id,
			intention.intention_text,
			intention.deceased,
			expect.any(Object)
		)
	})

	test("Retourne erreur si aucune disponibilité pour messes sans célébrant", async () => {
		const intention = { id: 3, intention_text: "Pour tous", deceased: false }
		const mass = { id: 103, celebrant_id: null, intention_id: null }

		Mass.findUnscheduledMassesByIntention.mockResolvedValue([mass])
		MassService.handleIndifferentDateWithoutCelebrantForPonctualIntention = jest.fn().mockResolvedValue({ status: "error" })

		const result = await MassService.assignToExistingMasses([intention])
		expect(result.error).toBe(true)
		expect(result.type).toBe("noDate")
	})
})

describe("MassService.assignNeuvaineOrTrentain", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test("Assigne une neuvaine avec célébrant spécifique", async () => {
		const intention = { id: 1, intention_text: "Pour les vivants", deceased: false, intention_type: "novena" }
		const masses = [
			{ id: 201, celebrant_id: 5 },
			{ id: 202, celebrant_id: 5 },
		]

		Mass.findUnscheduledMassesByIntention.mockResolvedValue(masses)
		MassService.assignNeuvaineOrTrentainWithSpecificCelebrant = jest.fn().mockResolvedValue([
			{ date: "2025-11-01", celebrant_id: 5, status: "scheduled" },
			{ date: "2025-11-02", celebrant_id: 5, status: "scheduled" },
		])
		Mass.update.mockResolvedValue(true)
		Intention.update.mockResolvedValue(true)

		const result = await MassService.assignNeuvaineOrTrentain([intention])
		expect(result.updatedMasses).toHaveLength(2)
		expect(result.updatedMasses[0].celebrant_id).toBe(5)
		expect(MassService.assignNeuvaineOrTrentainWithSpecificCelebrant).toHaveBeenCalled()
	})

	test("Assigne une trentain sans célébrant spécifique", async () => {
		const intention = { id: 2, intention_text: "Pour les défunts", deceased: true, intention_type: "thirty" }
		const masses = [
			{ id: 301, celebrant_id: null },
			{ id: 302, celebrant_id: null },
			{ id: 303, celebrant_id: null },
		]

		Mass.findUnscheduledMassesByIntention.mockResolvedValue(masses)
		MassService.assignNeuvaineOrTrentainWithoutSpecificCelebrant = jest.fn().mockResolvedValue([
			{ date: "2025-11-01", celebrant_id: 6, status: "scheduled" },
			{ date: "2025-11-02", celebrant_id: 6, status: "scheduled" },
			{ date: "2025-11-03", celebrant_id: 6, status: "scheduled" },
		])
		Mass.update.mockResolvedValue(true)
		Intention.update.mockResolvedValue(true)

		const result = await MassService.assignNeuvaineOrTrentain([intention])
		expect(result.updatedMasses).toHaveLength(3)
		expect(result.updatedMasses.every((m) => m.celebrant_id === 6)).toBe(true)
		expect(MassService.assignNeuvaineOrTrentainWithoutSpecificCelebrant).toHaveBeenCalled()
	})

	test("Retourne erreur si aucun célébrant disponible pour neuvaine", async () => {
		const intention = { id: 3, intention_text: "Pour la communauté", deceased: false, intention_type: "novena" }
		const masses = [{ id: 401, celebrant_id: null }]

		Mass.findUnscheduledMassesByIntention.mockResolvedValue(masses)
		MassService.assignNeuvaineOrTrentainWithoutSpecificCelebrant = jest.fn().mockResolvedValue({
			error: true,
			message: "Aucune période disponible",
		})

		const result = await MassService.assignNeuvaineOrTrentain([intention])
		expect(result.error).toBe(true)
	})
})
