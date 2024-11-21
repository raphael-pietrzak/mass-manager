// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import FormWizard from '../components/forms/formWizard';
import RegularityForm from '../components/forms/RegularityForm';
import CalendarView from '../pages/CalendrierPage';
import AdminPage from '../pages/AdminPage';
import HomePage from '../pages/HomePage';
import PendingMasses from '../pages/PendingMass';
import DatabaseTabs from '../pages/Database';

const tabs = [
  {
    key: 'donors',
    label: 'Donateurs',
    endpoint: 'http://localhost:3001/api/data/donors',
    columns: ['name', 'address', 'phone', 'email', 'amount', 'date', 'comment'],
  },
  {
    key: 'celebrants',
    label: 'Celebrants',
    endpoint: 'http://localhost:3001/api/data/celebrants',
  },
  {
    key: 'intentions',
    label: 'Intentions',
    endpoint: 'http://localhost:3001/api/data/intentions',
  },
  {
    key: 'masses',
    label: 'Masses',
    endpoint: 'http://localhost:3001/api/data/masses',
  },
  {
    key: 'special-days',
    label: 'Jours spéciaux',
    endpoint: 'http://localhost:3001/api/data/special-days',
  },
]


const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/intention" element={<FormWizard />} />
      <Route path="/regularity" element={<RegularityForm />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/pending" element={<PendingMasses />} />
      <Route path="/database" element={<DatabaseTabs  tabs={tabs} /> } />
      
    </Routes>
  </Router>
);


export default AppRouter;