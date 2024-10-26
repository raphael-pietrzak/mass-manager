// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import FormWizard from '../components/forms/formWizard';
import RegularityForm from '../components/forms/RegularityForm';


const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/about" element={<AboutPage />} />
      <Route path="/" element={<FormWizard />} />
      <Route path="/regularity" element={<RegularityForm />} />

    </Routes>
  </Router>
);

export default AppRouter;