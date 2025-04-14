exports.up = function(knex) {
    return knex.schema.table('SpecialDays', function(table) {
      table.boolean('is_recurrent').defaultTo(false);
    });
  };

  
  exports.down = function(knex) {
    return knex.schema.table('SpecialDays', function(table) {
      table.dropColumn('is_recurrent');
    });
  };
  