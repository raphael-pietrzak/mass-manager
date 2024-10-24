// migrations/xxxxxx_create_tables.js

exports.up = function(knex) {
    return knex.schema
      .createTable('Donors', function(table) {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 100);
        table.string('phone', 20);
        table.string('address', 255);
        table.boolean('wants_notification').defaultTo(false);
      })
      .createTable('Celebrants', function(table) {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 100);
        table.boolean('is_available').defaultTo(true);
      })
      .createTable('Intentions', function(table) {
        table.increments('id').primary();
        table.string('description').notNullable();
        table.decimal('amount');
        table.integer('donor_id').unsigned().references('id').inTable('Donors');
        table.datetime('date_requested');
      })
      .createTable('Masses', function(table) {
        table.increments('id').primary();
        table.datetime('date').notNullable();
        table.integer('celebrant_id').unsigned().references('id').inTable('Celebrants');
        table.integer('intention_id').unsigned().references('id').inTable('Intentions');
        table.enu('status', ['scheduled', 'cancelled']);
      })
      .createTable('SpecialDays', function(table) {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.text('note');
        table.integer('number_of_masses').defaultTo(0);
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('Masses')
      .dropTableIfExists('Intentions')
      .dropTableIfExists('Donors')
      .dropTableIfExists('Celebrants')
      .dropTableIfExists('SpecialDays');
  };