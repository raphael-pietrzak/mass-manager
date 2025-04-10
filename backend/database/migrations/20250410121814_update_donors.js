/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.renameTable('Donors', 'Donors_old');
  
    await knex.schema.createTable('Donors', function(table) {
      table.increments('id').primary();
      table.string('firstname', 50).notNullable();
      table.string('lastname', 50).notNullable();
      table.string('email', 100);
      table.string('phone', 20);
      table.string('address', 255);
      table.boolean('wants_notification').defaultTo(false);
    });
  
    const donors = await knex.select('*').from('Donors_old');
  
    for (const donor of donors) {
      const [firstname, ...rest] = donor.name?.split(' ') || [''];
      const lastname = rest.join(' ') || '';
  
      await knex('Donors').insert({
        id: donor.id,
        firstname: firstname,
        lastname: lastname,
        email: donor.email,
        phone: donor.phone,
        address: donor.address,
        wants_notification: donor.wants_notification
      });
    }
  
    await knex.schema.dropTable('Donors_old');
  };
  
  exports.down = async function(knex) {
    await knex.schema.renameTable('Donors', 'Donors_new');
  
    await knex.schema.createTable('Donors', function(table) {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('email', 100);
      table.string('phone', 20);
      table.string('address', 255);
      table.boolean('wants_notification').defaultTo(false);
    });
  
    const donors = await knex.select('*').from('Donors_new');
  
    for (const donor of donors) {
      const name = `${donor.firstname} ${donor.lastname}`.trim();
  
      await knex('Donors').insert({
        id: donor.id,
        name: name,
        email: donor.email,
        phone: donor.phone,
        address: donor.address,
        wants_notification: donor.wants_notification
      });
    }
  
    await knex.schema.dropTable('Donors_new');
  };
  
