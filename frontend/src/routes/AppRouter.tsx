// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import MassRequestForm from '../pages/MassRequestForm';
import OfferingForm from '../pages/OfferingForm';
import DonorForm from '../pages/DonorForm';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/about" element={<AboutPage />} />
      <Route path="/" element={<MassRequestForm />} />
      <Route path="/offering" element={<OfferingForm />} />
      <Route path="/donor" element={<DonorForm />} />


    </Routes>
  </Router>
);

export default AppRouter;