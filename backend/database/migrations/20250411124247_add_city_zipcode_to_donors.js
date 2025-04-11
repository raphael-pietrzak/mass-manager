export function up(knex) {
    return knex.schema.table('donors', function (table) {
      table.string('city');
      table.string('zip_code');
    });
  }
  
  export function down(knex) {
    return knex.schema.table('donors', function (table) {
      table.dropColumn('city');
      table.dropColumn('zip_code');
    });
  }
  