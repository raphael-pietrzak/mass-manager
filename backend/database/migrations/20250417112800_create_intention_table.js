exports.up = function(knex) {
    return knex.schema
      // Nouvelle table Intentions
      .createTable('Intentions', function(table) {
        table.increments('id').primary();
        table.integer('donor_id').unsigned().references('id').inTable('Donors');
        table.string('intention_text').notNullable();
        table.enu('type', ['vivants', 'defunts']).notNullable();
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
      
      // Mise à jour de la table Masses
      .alterTable('Masses', function(table) {
        // Supprimer les colonnes qui vont être déplacées vers Intentions
        table.dropColumn('intention');
        table.dropColumn('deceased');
        table.dropColumn('amount');
        table.dropColumn('wants_notification');
        
        // Ajouter une référence à la table Intentions
        table.integer('intention_id').unsigned().references('id').inTable('Intentions');
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      // Restaurer les colonnes supprimées dans Masses
      .alterTable('Masses', function(table) {
        table.string('intention').nullable();
        table.boolean('deceased').defaultTo(false);
        table.integer('amount').nullable();
        table.boolean('wants_notification').defaultTo(false);
        
        // Supprimer la référence à Intentions
        table.dropColumn('intention_id');
      })
      
      // Supprimer la nouvelle table
      .dropTable('Intentions');
  };