const db = require('../../config/database');

const User = {
    // Récupérer un utilisateur par son login_name
    getByLoginName: async (login_name) => {
        return db.select().from('Users').where('login_name', login_name).first(); // Utiliser `first()` pour obtenir un seul résultat
    },

    // Récupérer un utilisateur par son ID
    getById: async (id) => {
        return db.select().from('Users').where('id', id).first(); // Utiliser `first()` pour obtenir un seul résultat
    },

    // Mettre à jour un utilisateur
    update: async (id, userData) => {
        return db('Users').where('id', id).update(userData); // Mettre à jour l'utilisateur par ID
    },

    updatePassword: async (id, newPassword) => {
        return db('Users').where('id', id).update({ password: newPassword });
    },
};

module.exports = User;
