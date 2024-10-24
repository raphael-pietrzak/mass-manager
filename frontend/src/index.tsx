// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client'; // Assurez-vous d'utiliser la version appropriée de React
import App from './App'; // Chemin vers le fichier App.tsx
import './styles/index.css'; // Chemin vers le fichier CSS

// Créez un élément racine pour le DOM
const rootElement = document.getElementById('root'); // Assurez-vous que cet élément existe dans votre index.html

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement); // Pour React 18 et au-delà
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}