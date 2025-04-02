const db = require('../../config/database');

const User = {
    // Récupérer un utilisateur par son login_name
    getByLoginName: async (login_name) => {
        return db.select().from('Users').where('login_name', login_name).first(); // Utiliser `first()` pour obtenir un seul résultat
    },
};

module.exports = User;
