import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // Utiliser useNavigate pour la redirection
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setIsAuthenticated, checkAuth, userRole, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || userRole === null) return;

    const lastPage = sessionStorage.getItem('lastPage');

    if (lastPage) {
      navigate(lastPage);
    } else {
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'secretary':
          navigate('/calendar');
          break;
        case 'celebrant':
          navigate('/'); // Ou une page spécifique à celebrant ?
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, userRole, navigate]);

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
        setIsAuthenticated(true);
        await checkAuth(); // On vérifie ensuite l'authentification et met à jour le rôle
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Une erreur est survenue, veuillez réessayer.');
      }
    }
  };

  // Fonction pour gérer la soumission du formulaire quand "Entrée" est pressée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e);  // Appeler handleLogin si la touche "Enter" est pressée
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
              onKeyDown={handleKeyDown}  // Ajouter l'écouteur d'événements pour "Enter"
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
              onKeyDown={handleKeyDown}  // Ajouter l'écouteur d'événements pour "Enter"
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
