// migrations/20250410123456_update_mass_and_donor.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.alterTable('Donors', function(table) {
      table.dropColumn('wants_notification');
    });
  
    await knex.schema.alterTable('Masses', function(table) {
      table.boolean('wants_notification').defaultTo(false);
      table.enu('status', ['scheduled', 'cancelled', 'pending']).alter();
    });
  };
  
  exports.down = async function(knex) {
    await knex.schema.alterTable('Donors', function(table) {
      table.boolean('wants_notification').defaultTo(false);
    });
  
    await knex.schema.alterTable('Masses', function(table) {
      table.dropColumn('wants_notification');
      table.enu('status', ['scheduled', 'cancelled']).alter();
    });
  };
  