// src/HomePage.tsx
import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div className="home-container">
            <header className="header">
                <h1>Logiciel de Gestion et Répartition des Intentions de Messe</h1>
                <nav className="nav">
                    <ul>
                        <li><a href="#enregistrer-demande">Enregistrer une Demande</a></li>
                        <li><a href="#visualiser-messes">Visualiser les Messes</a></li>
                        <li><a href="#jours-particuliers">Jours Particuliers</a></li>
                        <li><a href="#administration">Administration</a></li>
                    </ul>
                </nav>
            </header>
            <main className="main-content">
                <section id="enregistrer-demande">
                    <h2>Enregistrer une Demande</h2>
                    <p>Utilisez cette section pour enregistrer les intentions de messe.</p>
                    <button onClick={() => alert("Formulaire d'enregistrement ouvert")}>Enregistrer une Demande Ponctuelle</button>
                    <button onClick={() => alert("Formulaire d'enregistrement ouvert")}>Enregistrer une Demande Régulière</button>
                </section>

                <section id="visualiser-messes">
                    <h2>Visualiser les Messes</h2>
                    <p>Visualisez et gérez les messes à venir.</p>
                    <button onClick={() => alert("Affichage des messes")}>Afficher les Messes en Attente</button>
                    <button onClick={() => alert("Affichage des mois")}>Publier un Mois</button>
                </section>

                <section id="jours-particuliers">
                    <h2>Jours Particuliers</h2>
                    <p>Ajoutez et gérez des jours particuliers pour les célébrations.</p>
                    <button onClick={() => alert("Formulaire d'ajout ouvert")}>Ajouter un Jour Particulier</button>
                </section>

                <section id="administration">
                    <h2>Administration</h2>
                    <p>Gérez les paramètres du système et les utilisateurs.</p>
                    <button onClick={() => alert("Administration ouverte")}>Accéder à l'Administration</button>
                </section>
            </main>

            <footer className="footer">
                <p>&copy; 2024 Logiciel de Gestion des Intentions de Messe. Tous droits réservés.</p>
            </footer>
        </div>
    );
}

export default HomePage;