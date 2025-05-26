const knex = require('knex');

// Configuration de la connexion à la base de données SQLite
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './database/mass_manager.db',
  },
  useNullAsDefault: true, // Nécessaire pour SQLite
  pool: {
		afterCreate: (conn, done) => {
			conn.run("PRAGMA foreign_keys = ON", done)
		},
	},
});

module.exports = db;