// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import CalendarPage from '../pages/CalendarPage';
import AdminPage from '../pages/AdminPage';
import HomePage from '../pages/HomePage';
import DatabaseTabs from '../pages/Database';
import { Intention } from '../pages/Intention';
import ProtectedRoute from './ProtectedRoutes';
import LoginPage from '../pages/LoginPage';





const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/intention" element={<Intention />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/database" element={<DatabaseTabs/> } />
      <Route path="/login" element={<LoginPage />} />
       {/* Route protégée */}
       <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
);


export default AppRouter;