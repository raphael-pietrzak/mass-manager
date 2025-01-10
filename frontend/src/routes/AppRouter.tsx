// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import CalendarView from '../pages/CalendrierPage';
import AdminPage from '../pages/AdminPage';
import HomePage from '../pages/HomePage';
import PendingMasses from '../pages/PendingMass';
import DatabaseTabs from '../pages/Database';
import { Intention } from '../pages/Intention';
import { Regularity } from '../pages/Regularity';




const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/intention" element={<Intention />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/pending" element={<PendingMasses />} />
      <Route path="/database" element={<DatabaseTabs/> } />
      
    </Routes>
  </Router>
);


export default AppRouter;