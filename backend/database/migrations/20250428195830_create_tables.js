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
    .createTable('Intentions', function(table) {
      table.increments('id').primary();
      table.integer('donor_id').unsigned().references('id').inTable('Donors');
      table.string('intention_text').notNullable();
      table.boolean('deceased').defaultTo(false);
      table.integer('amount').notNullable();
      table.enu('payment_method', ['cash', 'cheque', 'card', 'transfer']).notNullable();
      table.string('brother_name').nullable();
      table.boolean('wants_celebration_date').defaultTo(false);
      table.enu('date_type', ['specifique', 'indifferente']).defaultTo('indifferente');
      
      // Gestion de récurrence
      table.boolean('is_recurrent').defaultTo(false);
      table.enu('recurrence_type', ['daily', 'weekly', 'monthly']).nullable();
      table.integer('occurrences').nullable();
      table.date('start_date').nullable();
      table.enu('end_type', ['occurrences', 'date']).nullable();
      table.date('end_date').nullable();
      
      table.timestamps(true, true);
    })
    .createTable('Masses', function(table) {
      table.increments('id').primary();
      table.datetime('date').notNullable();
      table.integer('celebrant_id').unsigned().references('id').inTable('Celebrants');
      table.integer('donor_id').unsigned().references('id').inTable('Donors');
      table.integer('intention_id').unsigned().references('id').inTable('Intentions').onDelete('CASCADE');
      table.enu('status', ['scheduled', 'cancelled', 'pending']).defaultTo('pending');
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
      table.enu('role', ['admin', 'secretary', 'celebrant'])
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('Masses')
    .dropTableIfExists('Intentions')
    .dropTableIfExists('SpecialDays')
    .dropTableIfExists('Donors')
    .dropTableIfExists('Celebrants')
    .dropTableIfExists('Users');
};

