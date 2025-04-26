# Mass Manager

## Description

## Requirements

Node.js and npm are required to run this project. You can download them from [here](https://nodejs.org/en/download/).

## Usage

To run the project, you need to install the dependencies first. You can do this by running the following command in the project directory:

Open one terminal

```bash
cd backend
```

follow README.md in backend folder

Open another terminal

```bash
cd frontend
```

follow README.md in frontend folder

## Just copy paste this in your terminal

```bash
# Clone le dépôt
git clone https://github.com/raphael-pietrzak/mass-manager.git
cd mass-manager || exit 1

# Lancer le backend
echo "Installing and starting the backend..."
cd backend || exit 1
npm install
npm run migrate
npm run seed
npm start & # Lance le backend en arrière-plan
cd ..

# Lancer le frontend
echo "Installing and starting the frontend..."
cd frontend || exit 1
npm install
npm start
```

## Run

Terminal 1 Backend

```bash
cd backend
npm install
npm start
```

Terminal 2 Frontend

```bash
cd frontend
npm install
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Preview

Page 1
![alt text](<frontend/public/Capture d’écran 2025-01-10 à 22.26.59.png>)

Page 2
![alt text](<frontend/public/Capture d’écran 2025-01-10 à 22.27.08.png>)

Page 3
![alt text](<frontend/public/Capture d’écran 2025-01-10 à 22.27.14.png>)

Page 4
![alt text](<frontend/public/Capture d’écran 2025-01-10 à 22.27.18.png>)

Page 5
![alt text](<frontend/public/Capture d’écran 2025-01-10 à 22.27.23.png>)

## Deployment

```bash
git clone https://github.com/raphael-pietrzak/mass-manager.git
cd mass-manager
docker-compose up -d
```
