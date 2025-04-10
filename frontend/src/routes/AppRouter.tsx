// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarPage from '../pages/CalendarPage';
import AdminPage from '../pages/AdminPage';
import DatabaseTabs from '../pages/DatabasePage';
import ProtectedRoute from './ProtectedRoutes';
import LoginPage from '../pages/LoginPage';





const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/database" element={<DatabaseTabs/> } />
      <Route path="/login" element={<LoginPage />} />

       {/* Routes protégées */}
       <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  </Router>
);


export default AppRouter;