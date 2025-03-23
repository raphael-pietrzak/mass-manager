const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fonction de login
exports.loginUser = async (req, res) => {
  try {
    const { login_name, password } = req.body;

    // Chercher l'utilisateur par login_name
    const user = await User.getByLoginName(login_name);
     
    if (!user) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Mot de passe incorrect');
    }

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user.id, login_name: user.login_name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Répondre avec le token
    res.status(200).json({
      message: 'Authentification réussie',
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'authentification');
  }
};
