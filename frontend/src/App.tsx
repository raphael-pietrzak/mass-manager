// src/App.tsx
import React from 'react';
import AppRouter from './routes/AppRouter';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <div>
      <Navbar/>

      <AppRouter />
    </div>
  );
};

export default App;