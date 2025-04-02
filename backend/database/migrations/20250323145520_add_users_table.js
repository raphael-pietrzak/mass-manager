/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('Users', function(table) {
      table.increments('id').primary();        // Colonne `id`, clé primaire
      table.string('login_name', 100).notNullable(); // Colonne `login_name`
      table.string('password', 100).notNullable();   // Colonne `password`
      table.string('email', 100).notNullable();     // Colonne `email`
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('Users');
  };
  