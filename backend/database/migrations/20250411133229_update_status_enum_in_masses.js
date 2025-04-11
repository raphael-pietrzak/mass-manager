// migrations/20250410123456_update_mass_and_donor.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Supprimer la table `Masses` existante pour recréer avec la bonne contrainte CHECK
    await knex.schema.dropTableIfExists('Masses');
    
    await knex.schema.createTable('Masses', function(table) {
      table.increments('id').primary();
      table.datetime('date');
      table.integer('celebrant_id').unsigned();
      table.string('intention');
      table.enum('status', ['scheduled', 'cancelled', 'pending']).defaultTo('scheduled'); // Définit la contrainte CHECK ici
      table.boolean('wants_notification').defaultTo(false);
    });
  
    // Vous pouvez ajouter les autres tables ici si nécessaire (ex: Donors, etc.)
  };
  
  exports.down = async function(knex) {
    // Si vous avez besoin de revenir en arrière, supprimez la table
    await knex.schema.dropTableIfExists('Masses');
  };
  