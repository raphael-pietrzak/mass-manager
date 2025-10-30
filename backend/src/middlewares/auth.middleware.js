// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken")
exports.authenticateToken = (req, res, next) => {
	const publicPaths = ["/api/auth/login", "/api/cron"]

	// Si la route est publique, on passe
	if (publicPaths.some((path) => req.originalUrl.startsWith(path))) return next()

	// Vérifier d'abord l'en-tête d'autorisation
	const authHeader = req.headers["authorization"]
	const token = authHeader && authHeader.split(" ")[1] // Format: "Bearer TOKEN"

	if (!token) {
		return res.status(401).json({ error: "Access token manquant" })
	}

	jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET_KEY, (err, user) => {
		if (err) {
			console.error("Access token invalide ou expiré:", err)
			return res.status(403).json({ error: "Access token invalide ou expiré" })
		}
		req.user = user
		next()
	})
}

exports.authorizeAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ error: "Accès refusé : admin uniquement" })
	}
	next()
}
