#!/bin/bash

# Déplacer dans le dossier backend si nécessaire
cd backend || exit

# Installer les dépendances
npm install

# Vérifier si la base SQLite existe
DB_FILE="./database/mass_manager.db"

if [ ! -f "$DB_FILE" ]; then
  echo "📂 Base SQLite non trouvée, création et insertion..."
  # Créer la structure de la DB
  npm run migrate
  # Insérer les seeds
  npm run seed
else
  echo "✅ Base SQLite existante trouvée, pas de seed appliqué"
fi

# Démarrer le serveur
npm start