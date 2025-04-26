# frontend/Dockerfile
FROM node:20.11.0-alpine3.19

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Exécuter le build de l'application React
CMD ["sh", "-c", "npm run dev -- --host --port 5173"]


# Exposer le port 5173 pour le développement
EXPOSE 5173