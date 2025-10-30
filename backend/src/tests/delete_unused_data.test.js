// deleteBeforeDate.test.js
const db = require("../../config/database") // ton instance knex
jest.mock("../../config/database")

// Services à tester
const donorsService = require("../models/donor.model")
const specialDaysService = require("../models/specialDay.model")
const unavailableDaysService = require("../models/unavailableDay.model")
const intentionsService = require("../models/intention.model")

describe("deleteBeforeDate - tests complets", () => {
	const mockDate = new Date("2025-01-01")

	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ─────────────────────────────
	// 🧩 1️⃣ Donors.deleteBeforeDate
	// ─────────────────────────────
	describe("Donors.deleteBeforeDate", () => {
		it("supprime les donateurs valides (aucune intention active, aucune messe après la date)", async () => {
			const mockDel = jest.fn().mockResolvedValue(5)
			const whereNotExistsMocks = []

			const mockQuery = {
				whereNotExists(fn) {
					const ctx = {
						select: jest.fn().mockReturnThis(),
						from: jest.fn().mockReturnThis(),
						join: jest.fn().mockReturnThis(),
						whereRaw: jest.fn().mockReturnThis(),
						whereNot: jest.fn().mockReturnThis(),
						where: jest.fn().mockReturnThis(),
						andWhere: jest.fn().mockReturnThis(),
					}
					fn.call(ctx)
					whereNotExistsMocks.push(ctx)
					return this
				},
				del: mockDel,
			}

			db.mockReturnValue(mockQuery)

			const result = await donorsService.deleteBeforeDate(mockDate)

			expect(db).toHaveBeenCalledWith("Donors")
			expect(whereNotExistsMocks.length).toBe(2)

			// Vérif 1 : intentions non terminées
			const first = whereNotExistsMocks[0]
			expect(first.from).toHaveBeenCalledWith("Masses")
			expect(first.join).toHaveBeenCalledWith("Intentions", "Intentions.id", "Masses.intention_id")
			expect(first.whereRaw).toHaveBeenCalledWith("Intentions.donor_id = Donors.id")
			expect(first.whereNot).toHaveBeenCalledWith("Intentions.status", "completed")

			// Vérif 2 : intentions terminées après la date
			const second = whereNotExistsMocks[1]
			expect(second.where).toHaveBeenCalledWith("Intentions.status", "completed")
			expect(second.andWhere).toHaveBeenCalledWith("Masses.date", ">=", mockDate)

			expect(mockDel).toHaveBeenCalled()
			expect(result).toBe(5)
		})

		it("ne supprime rien si aucun donateur correspondant", async () => {
			const mockDel = jest.fn().mockResolvedValue(0)
			db.mockReturnValue({
				whereNotExists: () => ({ whereNotExists: () => ({ del: mockDel }) }),
			})

			const result = await donorsService.deleteBeforeDate(mockDate)
			expect(result).toBe(0)
		})

		it("propage les erreurs DB", async () => {
			const mockDel = jest.fn().mockRejectedValue(new Error("DB failure"))
			db.mockReturnValue({
				whereNotExists: () => ({ whereNotExists: () => ({ del: mockDel }) }),
			})

			await expect(donorsService.deleteBeforeDate(mockDate)).rejects.toThrow("DB failure")
		})
	})

	// ─────────────────────────────
	// 🗓️ 2️⃣ SpecialDays.deleteBeforeDate
	// ─────────────────────────────
	describe("SpecialDays.deleteBeforeDate", () => {
		it("supprime les jours spéciaux avant la date et non récurrents", async () => {
			const mockDel = jest.fn().mockResolvedValue(3)
			const mockAndWhere = jest.fn(() => ({ del: mockDel }))
			const mockWhere = jest.fn(() => ({ andWhere: mockAndWhere }))
			db.mockReturnValue({ where: mockWhere })

			const result = await specialDaysService.deleteBeforeDate(mockDate)

			expect(db).toHaveBeenCalledWith("SpecialDays")
			expect(mockWhere).toHaveBeenCalledWith("date", "<", mockDate)
			expect(mockAndWhere).toHaveBeenCalledWith("is_recurrent", 0)
			expect(mockDel).toHaveBeenCalled()
			expect(result).toBe(3)
		})

		it("ne supprime rien si aucun jour spécial trouvé", async () => {
			const mockDel = jest.fn().mockResolvedValue(0)
			db.mockReturnValue({ where: () => ({ andWhere: () => ({ del: mockDel }) }) })

			const result = await specialDaysService.deleteBeforeDate(mockDate)
			expect(result).toBe(0)
		})

		it("gère une erreur DB", async () => {
			const mockDel = jest.fn().mockRejectedValue(new Error("DB error"))
			db.mockReturnValue({ where: () => ({ andWhere: () => ({ del: mockDel }) }) })

			await expect(specialDaysService.deleteBeforeDate(mockDate)).rejects.toThrow("DB error")
		})
	})

	// ─────────────────────────────
	// 🚫 3️⃣ UnavailableDays.deleteBeforeDate
	// ─────────────────────────────
	describe("UnavailableDays.deleteBeforeDate", () => {
		it("supprime uniquement les jours indisponibles avant la date et non récurrents", async () => {
			const mockDel = jest.fn().mockResolvedValue(2)
			const mockAndWhere = jest.fn(() => ({ del: mockDel }))
			const mockWhere = jest.fn(() => ({ andWhere: mockAndWhere }))
			db.mockReturnValue({ where: mockWhere })

			const result = await unavailableDaysService.deleteBeforeDate(mockDate)

			expect(db).toHaveBeenCalledWith("UnavailableDays")
			expect(mockWhere).toHaveBeenCalledWith("date", "<", mockDate)
			expect(mockAndWhere).toHaveBeenCalledWith("is_recurrent", 0)
			expect(mockDel).toHaveBeenCalled()
			expect(result).toBe(2)
		})

		it("retourne 0 si aucun jour supprimé", async () => {
			const mockDel = jest.fn().mockResolvedValue(0)
			db.mockReturnValue({ where: () => ({ andWhere: () => ({ del: mockDel }) }) })

			const result = await unavailableDaysService.deleteBeforeDate(mockDate)
			expect(result).toBe(0)
		})

		it("lance une erreur en cas d’échec DB", async () => {
			const mockDel = jest.fn().mockRejectedValue(new Error("DB crash"))
			db.mockReturnValue({ where: () => ({ andWhere: () => ({ del: mockDel }) }) })

			await expect(unavailableDaysService.deleteBeforeDate(mockDate)).rejects.toThrow("DB crash")
		})
	})

	// ─────────────────────────────
	// 💒 4️⃣ Intentions.deleteBeforeDate
	// ─────────────────────────────
	describe("Intentions.deleteBeforeDate", () => {
		it("supprime les intentions completed, sans recurrence_id, avec messe avant la date", async () => {
			const mockDel = jest.fn().mockResolvedValue(7)

			const subquery = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				join: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
			}

			const mockQuery = {
				whereIn: jest.fn((_, fn) => {
					fn.call(subquery)
					return mockQuery
				}),
				whereNull: jest.fn(() => mockQuery),
				andWhere: jest.fn(() => ({ del: mockDel })),
			}

			db.mockReturnValue(mockQuery)

			const result = await intentionsService.deleteBeforeDate(mockDate)

			// Vérifie la sous-requête
			expect(subquery.from).toHaveBeenCalledWith("Intentions as intentions")
			expect(subquery.join).toHaveBeenCalledWith("Masses as masses", "masses.intention_id", "intentions.id")
			expect(subquery.where).toHaveBeenCalledWith("masses.date", "<", mockDate)

			// Vérifie la requête principale
			expect(mockQuery.whereNull).toHaveBeenCalledWith("recurrence_id")
			expect(mockQuery.andWhere).toHaveBeenCalledWith("status", "completed")
			expect(mockDel).toHaveBeenCalled()
			expect(result).toBe(7)
		})

		it("ne supprime rien si aucune intention correspondante", async () => {
			const mockDel = jest.fn().mockResolvedValue(0)
			db.mockReturnValue({
				whereIn: () => ({ whereNull: () => ({ andWhere: () => ({ del: mockDel }) }) }),
			})

			const result = await intentionsService.deleteBeforeDate(mockDate)
			expect(result).toBe(0)
		})

		it("gère les erreurs DB", async () => {
			const mockDel = jest.fn().mockRejectedValue(new Error("Database down"))
			db.mockReturnValue({
				whereIn: () => ({ whereNull: () => ({ andWhere: () => ({ del: mockDel }) }) }),
			})

			await expect(intentionsService.deleteBeforeDate(mockDate)).rejects.toThrow("Database down")
		})
	})
})
