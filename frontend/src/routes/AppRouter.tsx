// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarPage from '../pages/CalendarPage';
import AdminPage from '../pages/AdminPage';
import DatabaseTabs from '../pages/DatabasePage';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import FormWizard from '../components/forms/formWizard';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/intentions" element={<FormWizard />} />

       {/* Routes protégées */}
      <Route path="/database" element={<ProtectedRoute><DatabaseTabs/> </ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>}/>
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  </Router>
);

export default AppRouter;