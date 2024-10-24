
// Error404Page.tsx

import React from 'react';
// import '../styles/Error404Page.css';

const Error404Page: React.FC = () => {
    return (
        <div className="error-container">
            <header className="header">
                <h1>Page non trouvée</h1>
            </header>
            <main className="main-content">
                <section>
                    <h2>Erreur 404</h2>
                    <p>La page demandée n'existe pas.</p>
                </section>
            </main>
        </div>
    );
}

export default Error404Page;