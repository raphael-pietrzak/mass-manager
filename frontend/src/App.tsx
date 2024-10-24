import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Error404Page from './pages/Error404Page';
import AdminPage from './pages/AdminPage';




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
                <Route path="/admin" element={<AdminPage />} />


                {/* Page d'erreur 404 */}
                <Route path="*" element={<Error404Page />} />
            </Routes>
        </Router>
    );
}

export default App;