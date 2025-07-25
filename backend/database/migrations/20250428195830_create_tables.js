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
      table.string('civil_firstname', 50);
      table.string('civil_lastname', 50);
      table.string('title', 10).notNullable();
      table.string('role', 50);
      table.string('email', 100).nullable();
    })
    .createTable('Recurrences', function(table) {
      table.increments('id').primary();
      table.enu('type', ['daily', 'weekly', 'monthly', 'relative_position', 'yearly']).notNullable();
      table.date('start_date').notNullable();
      table.enu('end_type', ['occurrences', 'date']).notNullable();
      table.integer('occurrences').nullable();
      table.date('end_date').nullable();
      
      // Pour récurrence relative mensuelle
      table.enu('position', ['first', 'second', 'third', 'fourth', 'last']).nullable();
      table.enu('weekday', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).nullable();
      
      table.timestamps(true, true);
    })
    .createTable('Intentions', function(table) {
      table.increments('id').primary();
      table.integer('donor_id').unsigned().references('id').inTable('Donors').nullable().onDelete('SET NULL');
      table.string('intention_text').notNullable();
      table.boolean('deceased').defaultTo(false);
      table.integer('amount').notNullable();
      table.enu('payment_method', ['cash', 'cheque', 'card', 'transfer']).notNullable();
      table.string('brother_name').nullable();
      table.boolean('wants_celebration_date').defaultTo(false);
      table.enu('date_type', ['imperative', 'desired', 'indifferent']);
			table.enu('intention_type', ['thirty', 'novena', 'unit']);
      table.enum('status', ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
      table.integer('number_of_masses').defaultTo(1);
      
      // Référence vers la table récurrence
      table.integer('recurrence_id').unsigned().nullable().references('id').inTable('Recurrences').onDelete('SET NULL');
      table.timestamps(true, true);
    })
    .createTable('Masses', function(table) {
      table.increments('id').primary();
      table.date('date').nullable();
      table.integer('celebrant_id').unsigned().nullable().references('id').inTable('Celebrants').onDelete('SET NULL');
      table.integer('intention_id').unsigned().references('id').inTable('Intentions').onDelete('CASCADE');
      table.enum('status', ['pending', 'scheduled', 'cancelled', 'completed']).defaultTo('pending');
      table.timestamps(true, true);
    })
    .createTable('SpecialDays', function(table) {
      table.increments('id').primary();
      table.date('date').notNullable().unique();
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
    })
    .createTable('UnavailableDays', function(table) {
      table.increments('id').primary();
      table.integer('celebrant_id').unsigned().nullable().references('id').inTable('Celebrants').onDelete('SET NULL');
      table.date('date').notNullable();
      table.boolean('is_recurrent').defaultTo(false);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('Masses')
    .dropTableIfExists('Intentions')
    .dropTableIfExists('Recurrences')
    .dropTableIfExists('SpecialDays')
    .dropTableIfExists('Donors')
    .dropTableIfExists('Celebrants')
    .dropTableIfExists('Users')
    .dropTableIfExists('UnavailabledDay');
};

exports.down = function (knex) {
	return knex.schema
		.dropTableIfExists("Masses")
		.dropTableIfExists("Intentions")
		.dropTableIfExists("SpecialDays")
		.dropTableIfExists("Donors")
		.dropTableIfExists("Celebrants")
		.dropTableIfExists("Users")
		.dropTableIfExists("UnavailabledDay")
}
