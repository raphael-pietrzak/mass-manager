const RecurringIntentionService = require("../services/recurrence.service")
const Mass = require("../models/mass.model")
const Celebrant = require("../models/celebrant.model")
const { parseISO, format } = require("date-fns")

jest.mock("../models/mass.model")
jest.mock("../models/celebrant.model")

describe("RecurringIntentionService", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe("getNextRelativePositionDate", () => {
		it("trouve le premier lundi du mois à partir d'une date donnée", () => {
			const fromDate = parseISO("2025-11-05")
			const result = RecurringIntentionService.getNextRelativePositionDate(fromDate, "first", "monday")
			expect(result.getDay()).toBe(1)
			expect(result >= fromDate).toBe(true)
		})

		it("retourne null si weekday invalide", () => {
			const result = RecurringIntentionService.getNextRelativePositionDate(new Date(), "first", "noday")
			expect(result).toBeNull()
		})

		it("trouve le dernier vendredi du mois", () => {
			const fromDate = parseISO("2025-11-01")
			const result = RecurringIntentionService.getNextRelativePositionDate(fromDate, "last", 5)
			expect(result.getDay()).toBe(5)
		})
	})

	describe("handleGenerateRecurringMassPreview", () => {
		const mockCelebrant = { id: 1, religious_name: "Père Jean", celebrant_title: "Prêtre" }

		beforeEach(() => {
			Mass.isCelebrantAvailable.mockResolvedValue(true)
			Mass.getRandomAvailableCelebrant.mockResolvedValue(mockCelebrant)
			Celebrant.getById.mockResolvedValue(mockCelebrant)
		})

		it("génère des messes mensuelles sans célébrant spécifique", async () => {
			const params = {
				type: "monthly",
				start_date: "2025-11-01",
				end_type: "occurrences",
				occurrences: 3,
				intention_text: "Pour la paix",
			}

			const masses = await RecurringIntentionService.handleGenerateRecurringMassPreview(params)
			expect(masses.length).toBe(3)
			expect(masses[0].celebrant_name).toBe("Père Jean")
		})

		it("renvoie une erreur si le 29 février est choisi pour annuel", async () => {
			const params = {
				type: "yearly",
				start_date: "2024-02-29",
				end_type: "occurrences",
				occurrences: 1,
				intention_text: "Test",
			}

			await expect(RecurringIntentionService.handleGenerateRecurringMassPreview(params)).rejects.toThrow(
				"Impossible de choisir une intention récurrente annuelle le 29 février."
			)
		})

		it("lance une erreur si le célébrant spécifique est indisponible", async () => {
			Mass.isCelebrantAvailable.mockResolvedValue(false)
			const params = {
				type: "monthly",
				start_date: "2025-11-01",
				end_type: "occurrences",
				occurrences: 1,
				celebrant_id: 1,
				intention_text: "Test",
			}

			await expect(RecurringIntentionService.handleGenerateRecurringMassPreview(params)).rejects.toThrow(/n'est pas disponible/)
		})

		it("génère des messes avec position relative", async () => {
			const params = {
				type: "relative_position",
				start_date: "2025-11-01",
				end_type: "occurrences",
				occurrences: 2,
				position: "first",
				weekday: "monday",
				intention_text: "Test RP",
			}

			const masses = await RecurringIntentionService.handleGenerateRecurringMassPreview(params)
			expect(masses.length).toBe(2)
			expect(masses[0].celebrant_name).toBe("Père Jean")
		})
	})
})
