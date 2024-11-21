module.exports = {
    development: {
      client: 'sqlite3', 
      connection: {
        filename: './database/mass_manager.db',
      },
      migrations: {
        directory: './database/migrations',
      },
      seeds: {
        directory: './database/seeds',
      },
      useNullAsDefault: true, 
    },
  };