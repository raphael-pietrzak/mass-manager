// LoginPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { useAuth } from '../features/calendar/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // Utiliser useNavigate pour la redirection
  const location = useLocation();
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  //const { isAuthenticated, loading } = useAuth();
  const { setIsAuthenticated } = useAuth();

  // Récupérer la route d'origine avant la redirection vers /login
  const from = location.state?.from?.pathname || '/admin';  // Si aucun 'from', rediriger vers /admin par défaut

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          login_name: loginName,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsAuthenticated(true); // update le contexte global
        navigate(from);
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Une erreur est survenue, veuillez réessayer.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-12">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Gérez les paramètres et les actions administratives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          <div>
            <label className="block p-1 text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <Input
              type="text"
              placeholder="Votre nom d'utilisateur"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block p-1 text-sm font-medium text-gray-700">Mot de passe</label>
            <Input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-right">
            <a href="/forgot-password" className="text-blue-600 text-sm hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
          <Button className="w-full bg-blue-600 text-white" onClick={handleLogin}>
            Se connecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
