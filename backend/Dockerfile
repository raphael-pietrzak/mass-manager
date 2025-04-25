# backend/Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Exécuter les migrations et les seeds au démarrage
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]