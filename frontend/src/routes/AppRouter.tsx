// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarPage from '../pages/CalendarPage';
import AdminPage from '../pages/AdminPage';
import HomePage from '../pages/HomePage';
import DatabaseTabs from '../pages/Database';
import { Intention } from '../pages/Intention';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DonorsPage from '../pages/DonorsPage';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/intention" element={<Intention />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/database" element={<ProtectedRoute><DatabaseTabs/> </ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/donors" element={<DonorsPage/>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>}/>
    </Routes>
  </Router>
);

export default AppRouter;