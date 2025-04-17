const knex = require('knex');
const knexConfig = require('../knexfile');
const db = knex(knexConfig.test);

// Réinitialiser la base de données avant les tests
beforeAll(async () => {
  await db.migrate.rollback(undefined, true);
  await db.migrate.latest();
  await db.seed.run();
});

// Nettoyer après tous les tests
afterAll(async () => {
  await db.destroy();
});

// Mock pour la base de données
jest.mock('../config/database', () => {
  return require('knex')(require('../knexfile').test);
});
