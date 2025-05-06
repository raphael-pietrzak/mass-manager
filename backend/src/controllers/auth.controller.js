const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fonction de login
const loginUser = async (req, res) => {
  try {
    const { login_name, password } = req.body;

    // Chercher l'utilisateur par login_name
    const user = await User.getByLoginName(login_name);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user.id, login_name: user.login_name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    // Envoyer le token dans un cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'Lax',
      maxAge: 86400000, // 3600000 = 1h , pour 1 jour -> maxAge: 86400000
    });

    res.status(200).json({
      message: 'Authentification réussie',
      token: token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'authentification' });
  }
};

// Fonction de logout
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",       
  });
  res.status(200).json({ message: 'Déconnexion réussie' });
};

const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si le mot de passe actuel est correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Les nouveaux mots de passe ne correspondent pas' });
    }
    if(newPassword === confirmPassword && oldPassword === newPassword) {
      return res.status(200).json({ success: 'Aucun changement' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe dans la base de données
    await User.updatePassword(userId, hashedPassword);

    res.status(200).json({ success: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe' });
  }
};

// Exporter les fonctions en CommonJS
module.exports = {
  loginUser,
  logoutUser,
  changeUserPassword
};
