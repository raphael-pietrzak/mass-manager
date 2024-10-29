// src/HomePage.tsx
import React from 'react';

const HomePage: React.FC = () => {
    return (
        <ul>
            <li><a href="/about">À Propos</a></li>
            <li><a href="/intention">Accueil</a></li>
            <li><a href="/regularity">Régularité</a></li>
            <li><a href="/calendar">Calendrier</a></li>
            <li><a href="/admin">Administration</a></li>
        </ul>
    );
}

export default HomePage;