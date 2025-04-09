import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css';
import App from './App.tsx';
import { AuthProvider } from './features/calendar/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App/>
    </AuthProvider>
  </StrictMode>,
)

