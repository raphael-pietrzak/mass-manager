const MassService = require("../services/mass.service")
const Mass = require("../models/mass.model")
const Intention = require("../models/intention.model")
const Celebrant = require("../models/celebrant.model")

jest.mock("../models/mass.model")
jest.mock("../models/intention.model")
jest.mock("../models/celebrant.model")

describe("MassService.generateMassPreview", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test("Génère une messe unique sans célébrant et date indifférente", async () => {
		const params = {
			intention_text: "Pour la paix",
			mass_count: 1,
			date_type: "indifferent",
			intention_type: "unit",
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses).toHaveLength(1)
		expect(masses[0].date).toBeNull()
		expect(masses[0].celebrant_id).toBeUndefined() // pas de célébrant
		expect(masses[0].status).toBe("pending")
	})

	test("Génère une neuvaine avec célébrant spécifique et date indifférente", async () => {
		const celebrantMock = { id: 1, title: "Père", religious_name: "Jean" }
		Celebrant.getById.mockResolvedValue(celebrantMock)

		const params = {
			intention_text: "Pour les défunts",
			intention_type: "novena",
			date_type: "indifferent",
			celebrant_id: 1,
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses).toHaveLength(9)
		expect(masses.every((m) => m.celebrant_id === 1)).toBe(true)
		expect(masses.every((m) => m.status === "pending")).toBe(true)
	})

	test("Génère une messe avec date impérative et célébrant spécifique disponible", async () => {
		const celebrantMock = { id: 2, title: "Père", religious_name: "Paul" }
		Celebrant.getById.mockResolvedValue(celebrantMock)
		Mass.isCelebrantAvailable.mockResolvedValue(true)

		const params = {
			intention_text: "Pour la famille",
			mass_count: 1,
			date_type: "imperative",
			intention_type: "unit",
			start_date: "2025-11-01",
			celebrant_id: 2,
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses[0].date).toBe("2025-11-01")
		expect(masses[0].celebrant_id).toBe(2)
		expect(masses[0].status).toBe("scheduled")
	})

	test("Génère une messe avec date impérative et célébrant indisponible", async () => {
		Mass.isCelebrantAvailable.mockResolvedValue(false)

		const params = {
			intention_text: "Pour les malades",
			mass_count: 1,
			date_type: "imperative",
			intention_type: "unit",
			start_date: "2025-11-01",
			celebrant_id: 3,
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses[0].status).toBe("error")
		expect(masses[0].celebrant_name).toBe("Aucun célébrant disponible")
	})

	test("Génère une neuvaine avec date impérative et sans célébrant spécifique", async () => {
		const availableCelebrant = { id: 4, title: "Père", religious_name: "Marc" }
		Mass.isCelebrantAvailable.mockResolvedValue(true)
		Celebrant.getAll.mockResolvedValue([availableCelebrant])
		Celebrant.getMassCountForMonth.mockResolvedValue(0)

		const params = {
			intention_text: "Pour les vivants",
			intention_type: "novena",
			date_type: "imperative",
			start_date: "2025-11-01",
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses).toHaveLength(9)
		expect(masses.every((m) => m.celebrant_id === 4)).toBe(true)
		expect(masses.every((m) => m.status === "scheduled")).toBe(true)
	})

	test("Génère une messe souhaitée sans célébrant spécifique mais disponible", async () => {
		const availableCelebrant = { id: 5, title: "Père", religious_name: "Luc" }
		Mass.getRandomAvailableCelebrant.mockResolvedValue(availableCelebrant)

		const params = {
			intention_text: "Pour les enfants",
			mass_count: 1,
			date_type: "desired",
			intention_type: "unit",
			start_date: "2025-11-05",
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses[0].celebrant_id).toBe(5)
		expect(masses[0].status).toBe("scheduled")
	})

	test("Retourne erreur si aucun célébrant disponible pour date souhaitée", async () => {
		Mass.getRandomAvailableCelebrant.mockResolvedValue(null)
		Mass.findNextAvailableSlot.mockResolvedValue(null)

		const params = {
			intention_text: "Pour la communauté",
			mass_count: 1,
			date_type: "desired",
			intention_type: "unit",
			start_date: "2025-11-05",
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses[0].status).toBe("error")
		expect(masses[0].error).toBe("no_availability")
	})

	test("Génère plusieurs messes indifférentes sans célébrant spécifique", async () => {
		jest.spyOn(MassService, "handleIndifferentDate").mockResolvedValue({
			date: null,
			intention: "Test",
			status: "pending",
		})

		const params = {
			intention_text: "Intentions multiples",
			mass_count: 3,
			date_type: "indifferent",
			intention_type: "unit",
		}

		const masses = await MassService.generateMassPreview(params)
		expect(masses).toHaveLength(3)
		expect(masses.every((m) => m.status === "pending")).toBe(true)
	})
})
