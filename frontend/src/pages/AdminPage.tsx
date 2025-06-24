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
import CalendarSelector from '../components/CalendarSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const AdminPage = () => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('example@monemail.com');
  const [showCelebrantDialog, setShowCelebrantDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();
  const [deleteBeforeDate, setDeleteBeforeDate] = useState(new Date());
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [users, setUsers] = useState<{ id: number; login_name: string, email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleDateChange = (date: Date | undefined) => {
    setDeleteBeforeDate(date || new Date()); // Si aucune date n'est sélectionnée, on prend la date actuelle
  };

  const handleSave = () => {
    console.log('Sauvegarde effectuée');
  };

  const handleDeleteHistory = (date: Date) => {
    axios.delete(`${API_BASE_URL}/api/data/masses`, { params: { date: date } })
    axios.delete(`${API_BASE_URL}/api/data/special-days`, {params : {date: date}})
    axios.delete(`${API_BASE_URL}/api/data/unavailable-days`, {params : {date: date}})
    axios.delete(`${API_BASE_URL}/api/data/intentions`)
    setSuccessMessage('Les données antérieures à cette date ont bien été supprimées.');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/users`, { withCredentials: true });
        setUsers(response.data);
        // Chercher l'utilisateur avec login "secretariat" et le définir par défaut
        const secretariat = response.data.find((user: { login_name: string }) => user.login_name === 'secretariat');
        if (secretariat) {
          //setSecretariatUser(secretariat);
          setSelectedUserId(secretariat.id); // Sélectionner l'utilisateur "secretariat" par défaut
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      }
    };
    fetchUsers(); // Appel de la fonction pour récupérer les données
  }, []);

  useEffect(() => {
    if (selectedUserId !== null) {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        setNewEmail(user.email || '');
      }
    }
  }, [selectedUserId, users]);

  const handlePasswordChange = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    const userId = selectedUserId;
    if (!newPassword) {
      setErrorMessage("Nouveau mot de passe obligatoire pour confirmer");
      return;
    }
    try {
      // Envoyer la requête pour changer le mot de passe
      const response = await axios.post(`${API_BASE_URL}/api/auth/change_password/${userId}`, {
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

  const handleEmailChange = async () => {
    const userId = selectedUserId;
    setErrorMessage("");
    setSuccessMessage("");
    if (!newEmail) {
      setErrorMessage("Nouvel email obligatoire pour confirmer");
      return;
    }
    try {
      // Envoyer la requête pour changer l'email
      const response = await axios.post(`${API_BASE_URL}/api/auth/change_email/${userId}`, {
        newEmail,
      }, {
        withCredentials: true,
      });
      setNewEmail(newEmail);
      setShowEmailDialog(false); // Fermer le dialogue après succès
      setSuccessMessage(response.data.success); // Message de succès
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Si l'erreur provient d'une requête Axios, afficher le message d'erreur
        setErrorMessage(error.response?.data.error || "Une erreur est survenue lors du changement d'email.");
      } else {
        setErrorMessage("Une erreur inconnue est survenue.");
      }
    }
    setNewEmail(newEmail);
    setSuccessMessage('L\'adresse e-mail a été changée avec succès.');
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
            disabled={true}
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
                <AlertDialogTitle>Supprimer les données antérieures à :</AlertDialogTitle>
                <div className="mt-4">
                  <CalendarSelector
                    selectedDate={deleteBeforeDate}
                    onDateChange={handleDateChange}
                    ignoreAvailability
                  />
                </div>
                <AlertDialogDescription className="mt-4">
                  ⚠ Cette action va supprimer définitivement ttoutes les données non utilisées antérieures à cette date.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => setShowDeleteConfirmDialog(true)}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Confirmation de suppression */}
          <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer toutes les données non utilisées antérieures à cette date ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDeleteConfirmDialog(false)}>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    handleDeleteHistory(deleteBeforeDate); // Appelle la fonction pour supprimer les données
                    setShowDeleteConfirmDialog(false); // Ferme la confirmation de suppression
                  }}
                >
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
                Changer les mots de passe des utilisateurs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='mb-5'>Changer les mots de passe</AlertDialogTitle>
                <div className="space-y-10">
                  {/* formulaire de choix utilisateur */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un utilisateur :</label>
                    <Select value={selectedUserId?.toString()} onValueChange={(val: string) => setSelectedUserId(Number(val))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.login_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4">
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
                </div>
                {/* </AlertDialogDescription> */}
              </AlertDialogHeader>
              {errorMessage && (
                <Alert className="bg-red-50 border-red-300 text-red-800">
                  <AlertTitle className="flex items-center space-x-2"><X color="red" size={22} /> Erreur</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
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
                  <div className="mb-4">
                    {/* <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un utilisateur :</label> */}
                    <Select value={selectedUserId?.toString()} onValueChange={(val: string) => setSelectedUserId(Number(val))} disabled={true}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.login_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="email"
                    placeholder="Nouvelle adresse e-mail"
                    value={newEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                    className="mt-4 text-black"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              {errorMessage && (
                <Alert className="bg-red-50 border-red-300 text-red-800">
                  <AlertTitle className="flex items-center space-x-2"><X color="red" size={22} /> Erreur</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
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
