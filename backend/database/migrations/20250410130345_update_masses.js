/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .table('Masses', function(table) {
        // Supprimer les colonnes type et location
        table.dropColumn('type');
        table.dropColumn('location');
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .table('Masses', function(table) {
        // Re-ajouter les colonnes 'type' et 'location' si on annule la migration
        table.enu('type', ['basse', 'chantée']).defaultTo('basse');
        table.string('location').defaultTo('Chapelle principale');
      });
  };
  
