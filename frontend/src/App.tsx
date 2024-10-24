import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Error404Page from './pages/Error404Page';


{/* <nav className="nav">
    <ul>
        <li><a href="#enregistrer-demande">Enregistrer une Demande</a></li>
        <li><a href="#visualiser-messes">Visualiser les Messes</a></li>
        <li><a href="#jours-particuliers">Jours Particuliers</a></li>
        <li><a href="#administration">Administration</a></li>
    </ul>
</nav> */}


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Pages publiques */}
                <Route path="/" element={<HomePage />} />
                <Route path="/enregistrer-demande" element={<HomePage />} />
                <Route path="/visualiser-messes" element={<HomePage />} />
                <Route path="/jours-particuliers" element={<HomePage />} />
                <Route path="/administration" element={<HomePage />} />

                {/* Pages administrateurs */}


                {/* Page d'erreur 404 */}
                <Route path="*" element={<Error404Page />} />
            </Routes>
        </Router>
    );
}

export default App;