const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Fonction de login
const loginUser = async (req, res) => {
	try {
		const { login_name, password } = req.body

		// Chercher l'utilisateur par login_name
		const user = await User.getByLoginName(login_name)

		if (!user) {
			return res.status(404).json({ error: "Utilisateur non trouvé" })
		}

		// Vérifier si le mot de passe correspond
		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(401).json({ error: "Mot de passe incorrect" })
		}

		// Créer un access token (courte durée)
		const accessToken = jwt.sign(
			{ userId: user.id, login_name: user.login_name, role: user.role },
			process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET_KEY,
			{ expiresIn: "15m" }
		)

		// Créer un refresh token (longue durée)
		const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_KEY, { expiresIn: "7d" })

		// Envoyer le refresh token dans un cookie HttpOnly
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "development",
			sameSite: "Lax",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
			path: "/",
		})

		res.status(200).json({
			message: "Authentification réussie",
			accessToken,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Erreur lors de l'authentification" })
	}
}

// Fonction de logout
const logoutUser = (req, res) => {
	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "development",
		sameSite: "Lax",
		path: "/",
	})
	res.status(200).json({ message: "Déconnexion réussie" })
}

// Fonction pour rafraîchir l'access token
const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken

		if (!refreshToken) {
			return res.status(401).json({ error: "Refresh token manquant" })
		}

		// Vérifier le refresh token
		jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_KEY, async (err, decoded) => {
			if (err) {
				return res.status(403).json({ error: "Refresh token invalide ou expiré" })
			}

			try {
				// Récupérer l'utilisateur depuis la base de données
				const user = await User.getById(decoded.userId)

				if (!user) {
					return res.status(404).json({ error: "Utilisateur non trouvé" })
				}

				// Générer un nouveau access token
				const accessToken = jwt.sign(
					{ userId: user.id, login_name: user.login_name, role: user.role },
					process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET_KEY,
					{ expiresIn: "15m" }
				)

				res.status(200).json({ accessToken })
			} catch (error) {
				console.error(error)
				res.status(500).json({ error: "Erreur serveur lors du rafraîchissement du token" })
			}
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Erreur lors du rafraîchissement du token" })
	}
}

const getUsers = async (req, res) => {
	try {
		const users = await User.getUsers()
		if (!users) {
			return res.status(404).json({ error: "Aucun utilisateur trouvé" })
		}
		res.status(200).json(users)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" })
	}
}

const changeUserEmail = async (req, res) => {
	try {
		const userId = req.params.id
		const { newEmail } = req.body

		// Vérifier si le nouvel email est valide
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(newEmail)) {
			return res.status(400).json({ error: "Email invalide" })
		}

		// Récupérer l'utilisateur actuel
		const user = await User.getById(userId)
		if (!user) {
			return res.status(404).json({ error: "Utilisateur non trouvé" })
		}

		// Vérifier si le nouvel email est identique à l'actuel
		if (user.email === newEmail) {
			return res.status(200).json({ success: "Aucun changement" })
		}

		// Vérifier si l'email est déjà utilisé par un autre utilisateur
		const emailUsed = await User.getByEmail(newEmail)
		if (emailUsed && emailUsed.id !== user.id) {
			return res.status(400).json({ error: "Cet email est déjà utilisé" })
		}

		// Mettre à jour l'email dans la base de données
		await User.updateEmail(userId, newEmail)

		res.status(200).json({ success: "Email mis à jour avec succès" })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Erreur lors de la mise à jour de l'email" })
	}
}

const changeUserPassword = async (req, res) => {
	try {
		const userId = req.params.id
		const { oldPassword, newPassword, confirmPassword } = req.body

		// Vérifier si l'utilisateur existe
		const user = await User.getById(userId)
		if (!user) {
			return res.status(404).json({ error: "Utilisateur non trouvé" })
		}

		// Vérifier si le mot de passe actuel est correct
		const isMatch = await bcrypt.compare(oldPassword, user.password)
		if (!isMatch) {
			return res.status(401).json({ error: "Ancien mot de passe incorrect" })
		}

		if (newPassword !== confirmPassword) {
			return res.status(400).json({ error: "Les nouveaux mots de passe ne correspondent pas" })
		}
		if (newPassword === confirmPassword && oldPassword === newPassword) {
			return res.status(200).json({ success: "Aucun changement" })
		}

		// Hacher le nouveau mot de passe
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// Mettre à jour le mot de passe dans la base de données
		await User.updatePassword(userId, hashedPassword)

		res.status(200).json({ success: "Mot de passe mis à jour avec succès" })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe" })
	}
}

// Exporter les fonctions en CommonJS
module.exports = {
	loginUser,
	logoutUser,
	refreshToken,
	changeUserPassword,
	changeUserEmail,
	getUsers,
}
