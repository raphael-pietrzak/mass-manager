// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarPage from '../pages/CalendarPage';
import AdminPage from '../pages/AdminPage';
import DatabaseTabs from '../pages/DatabasePage';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DonorsPage from '../pages/DonorsPage';
import IntentionPage from '../pages/IntentionPage';
import Navbar from '../components/Navbar';

const AppRouter: React.FC = () => (
  <Router>
    <Navbar />
    <Routes>
      {/* Route publique */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes accessibles à admin ou secretary */}
      <Route path="/" element={<ProtectedRoute requiredRole={['admin', 'secretary']}><CalendarPage /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute requiredRole={['admin', 'secretary']}> <CalendarPage /></ProtectedRoute>} />
      <Route path="/donors" element={<ProtectedRoute requiredRole={['admin', 'secretary']}> <DonorsPage /> </ProtectedRoute>} />
      <Route path="/intentions" element={<ProtectedRoute requiredRole={['admin', 'secretary']}> <IntentionPage /> </ProtectedRoute>} />

      {/* Routes réservées à admin uniquement */}
      <Route path="/database" element={<ProtectedRoute requiredRole={['admin']}> <DatabaseTabs /> </ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requiredRole={['admin']}> <AdminPage /> </ProtectedRoute>} />
    </Routes>
  </Router>


);

export default AppRouter;