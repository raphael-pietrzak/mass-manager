# backend/Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Rendre le script exécutable
RUN chmod +x ./start.sh

# Utiliser le script pour vérifier les migrations au démarrage
CMD ["./start.sh"]