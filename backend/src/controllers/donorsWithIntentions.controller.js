exports.getDonorsWithIntentions = async (req, res) => {
    try {
      // Jointure entre la table Donors et Intentions
      const donorsWithIntentions = await knex('Donors')
        .leftJoin('Intentions', 'Donors.id', '=', 'Intentions.donor_id')
        .select(
          'Donors.name',
          'Donors.email',
          'Donors.phone',
          'Donors.address',
          'Intentions.description',
          'Intentions.amount'
        );
  
      // Structure pour organiser par donneur
      const result = donorsWithIntentions.reduce((acc, donor) => {
        const donorId = donor.donor_id;
        if (!acc[donorId]) {
          acc[donorId] = {
            name: donor.name,
            email: donor.email,
            phone: donor.phone,
            address: donor.address,
            intentions: []
          };
        }
  
        if (donor.description) { // Si le donneur a des intentions
          acc[donorId].intentions.push({
            description: donor.description,
            amount: donor.amount
          });
        }
  
        return acc;
      }, {});
  
      // Convertir l'objet en un tableau
      const donorsList = Object.values(result);
  
      res.json(donorsList); // Retourner la liste des donneurs et leurs intentions
    } catch (error) {
      console.error('Erreur lors de la récupération des donneurs et intentions:', error);
      res.status(500).send('Erreur lors de la récupération des données');
    }
  };
  