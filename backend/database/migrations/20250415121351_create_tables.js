// migrations/xxxxxx_create_tables.js

exports.up = function(knex) {
    return knex.schema
      .createTable('Donors', function(table) {
        table.increments('id').primary();
        table.string('lastname', 100).notNullable();
        table.string('firstname', 100).notNullable();
        table.string('email', 100)
        table.string('phone', 20);
        table.string('address', 255);
        table.string('city', 100);
        table.string('zip_code', 20);
      })
      .createTable('Celebrants', function(table) {
        table.increments('id').primary();
        table.string('religious_name', 50).notNullable();
        table.string('civil_first_name', 50).notNullable();
        table.string('civil_last_name', 50).notNullable();
        table.string('title', 10);
        table.string('role', 50);
      })
      .createTable('Masses', function(table) {
        table.increments('id').primary();
        table.datetime('date').notNullable();
        table.integer('celebrant_id').unsigned().references('id').inTable('Celebrants');
        table.string('intention').nullable();
        table.enu('status', ['scheduled', 'cancelled', 'pending']).defaultTo('pending');
        table.boolean('deceased').defaultTo(false);
        table.integer('amount').nullable();
        table.boolean('wants_notification').defaultTo(false);
      })
      .createTable('SpecialDays', function(table) {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.text('note');
        table.integer('number_of_masses').defaultTo(0);
        table.boolean('is_recurrent').defaultTo(false);
      })
      .createTable('Users', function(table) {
        table.increments('id').primary();
        table.string('login_name', 100).notNullable();
        table.string('password', 100).notNullable();
        table.string('email', 100).notNullable();
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('Masses')
      .dropTableIfExists('Donors')
      .dropTableIfExists('Celebrants')
      .dropTableIfExists('SpecialDays')
      .dropTableIfExists('Users');
  };

// migrations/xxxxxx_create_tables.js

exports.up = function(knex) {
    return knex.schema
      .createTable('Donors', function(table) {
        table.increments('id').primary();
        table.string('firstname', 100).notNullable();
        table.string('lastname', 100).notNullable();
        table.string('email', 100);
        table.string('phone', 20);
        table.string('address', 255);
        table.string('city', 100);
        table.string('zip_code', 20);
      })
      .createTable('Celebrants', function(table) {
        table.increments('id').primary();
        table.string('religious_name', 50).notNullable();
        table.string('civil_firstname', 50).notNullable();
        table.string('civil_lastname', 50).notNullable();
        table.string('title', 10);
        table.string('role', 50);
      })
      .createTable('Masses', function(table) {
        table.increments('id').primary();
        table.datetime('date').notNullable();
        table.integer('celebrant_id').unsigned().references('id').inTable('Celebrants');
        table.string('intention').nullable();
        table.enu('status', ['scheduled', 'cancelled', 'pending']).defaultTo('pending');
        table.boolean('deceased').defaultTo(false);
        table.integer('amount').nullable();
        table.boolean('wants_notification').defaultTo(false);
      })
      .createTable('SpecialDays', function(table) {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.text('description').notNullable();
        table.integer('number_of_masses').defaultTo(0);
        table.boolean('is_recurrent').defaultTo(false);
      })
      .createTable('Users', function(table) {
        table.increments('id').primary();
        table.string('login_name', 100).notNullable();
        table.string('password', 100).notNullable();
        table.string('email', 100).notNullable();
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('Masses')
      .dropTableIfExists('Donors')
      .dropTableIfExists('Celebrants')
      .dropTableIfExists('SpecialDays')
      .dropTableIfExists('Users');
  };

