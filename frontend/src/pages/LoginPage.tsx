import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // Utiliser useNavigate pour la redirection
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin'); // Si un token existe, rediriger vers la page d'accueil
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Réinitialiser les messages d'erreur
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_name: loginName, password: password }),
      });
  
      const data = await response.json(); // Parse directement la réponse JSON
      if (!response.ok) {
        setErrorMessage(data.error);
        return;
      }
  
      // Si la réponse est OK, rediriger
      localStorage.setItem('token', data.token);
      window.location.href = '/admin';
  
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setErrorMessage('Une erreur est survenue, veuillez réessayer.'); // Erreur générale en cas d'exception
    }
  };
  
     
  // Fonction pour détecter l'appui sur la touche "Entrée"
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e); // Appeler la fonction de connexion lorsqu'Entrée est pressée
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
