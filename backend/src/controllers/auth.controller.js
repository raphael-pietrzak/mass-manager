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
      { expiresIn: '1h' }
    );

    // Envoyer le token dans un cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 3600000, // 1 jour
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

// Exporter les deux fonctions en CommonJS
module.exports = {
  loginUser,
  logoutUser
};
