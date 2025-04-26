import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, Trash2, UserPlus, Lock, Mail, Database, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CelebrantManager } from '../features/admin/CelebrantManager';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';


const AdminPage = () => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [showCelebrantDialog, setShowCelebrantDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const navigate = useNavigate();
  const [deleteBeforeDate, setDeleteBeforeDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // format 'YYYY-MM-DD'
  });
  
  const handleSave = () => {
    console.log('Sauvegarde effectuée');
  };

  const handleDeleteHistory = (date: string) => {
    console.log('Historique supprimé avant la date:', date);
  };

  const handlePasswordChange = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if(!newPassword) {
      setErrorMessage("Nouveau mot de passe obligatoire pour confirmer");
      return;
    }
    try {
      // Envoyer la requête pour changer le mot de passe
      const response = await axios.post(`${API_BASE_URL}/api/auth/change_password`, {
        oldPassword,
        newPassword,
        confirmPassword,
      }, {
        withCredentials: true,
      });
      // Si la mise à jour du mot de passe réussit
      setSuccessMessage(response.data.success); // Message de succès
      setOldPassword(''); // Réinitialiser le champ du mot de passe ancien
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false); // Fermer le dialogue après succès   
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Si l'erreur provient d'une requête Axios, afficher le message d'erreur
        setErrorMessage(error.response?.data.error || "Une erreur est survenue lors du changement de mot de passe.");
      } else {
        setErrorMessage("Une erreur inconnue est survenue.");
      }
    }
  };

  const handleEmailChange = () => {
    console.log('Nouvel email:', newEmail);
    setShowEmailDialog(false);
  };

   useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage(undefined);
        }, 4000);  
        return () => clearTimeout(timer);
      }
      if (errorMessage) {
        const timer = setTimeout(() => {
          setErrorMessage(undefined);
        }, 4000);  
        return () => clearTimeout(timer);
      }
    }, [successMessage, errorMessage]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
       {/* Success message */}
       {successMessage && (
        <Alert className="bg-green-50 border-green-300 text-green-800">
          <AlertTitle>✓ Succès</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
        )}
      <Card>
        <CardHeader>
          <CardTitle>Administration</CardTitle>
          <CardDescription>Gérez les paramètres et les actions administratives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => navigate('/database')}
          >
            <Database className="mr-2 h-4 w-4" />
            Base de données
          </Button>

          {/* Gestion des célébrants */}
          <Button className="w-full justify-start" variant="outline" onClick={() => setShowCelebrantDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Gestion des célébrants
          </Button>
          <CelebrantManager
            open={showCelebrantDialog}
            onOpenChange={setShowCelebrantDialog}
          />

          {/* Sauvegarder */}
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>

          {/* Supprimer l'historique */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full justify-start" 
                variant="outline"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer l'historique d'années écoulées
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer les intentions de messe antérieures à :</AlertDialogTitle>
                <div className="mt-4">
                  <input
                    type="date"
                    name="deleteBeforeDate"
                    value={deleteBeforeDate}
                    onChange={(e) => setDeleteBeforeDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <AlertDialogDescription className="mt-4">
                  ⚠ Cette action va supprimer définitivement toutes les intentions de messe antérieures à cette date.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteHistory(deleteBeforeDate)}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Changer le mot de passe */}
          <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full justify-start" 
                variant="outline"
              >
                <Lock className="mr-2 h-4 w-4" />
                Changer le mot de passe de connexion
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Changer le mot de passe</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="mt-6">
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Ancien mot de passe</label>
                    <Input
                      type="password"
                      placeholder="Ancien mot de passe"
                      value={oldPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                      className="mt-2"
                    />
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mt-4">Nouveau mot de passe</label>
                    <Input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                      className="mt-2"
                    />
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mt-4">Confirmer le nouveau mot de passe</label>
                    <Input
                      type="password"
                      placeholder="Confirmer le nouveau mot de passe"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault(); // Empêche la fermeture automatique
                    handlePasswordChange(); // Exécute la logique du changement de mot de passe
                  }}
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
              {errorMessage && (
                // <Alert className="bg-green-50 border-green-300 text-green-800"></Alert>
                <Alert className="bg-red-50 border-red-300 text-red-800">
                  <AlertTitle className="flex items-center space-x-2"><X color="red" size={22} /> Erreur</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </AlertDialogContent>
          </AlertDialog>

          {/* Changer l'email */}
          <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full justify-start" 
                variant="outline"
              >
                <Mail className="mr-2 h-4 w-4" />
                Changer l'adresse e-mail du secrétaire
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Changer l'adresse e-mail</AlertDialogTitle>
                <AlertDialogDescription>
                  <Input
                    type="email"
                    placeholder="Nouvelle adresse e-mail"
                    value={newEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                    className="mt-4"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleEmailChange}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
