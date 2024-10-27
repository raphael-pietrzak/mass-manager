import { useState } from 'react';
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
import { Save, Trash2, UserPlus, Lock, Mail } from 'lucide-react';

const AdminPage = () => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleSave = () => {
    // Logique de sauvegarde
    console.log('Sauvegarde effectuée');
  };

  const handleDeleteHistory = () => {
    // Logique de suppression de l'historique
    console.log('Historique supprimé');
  };

  const handleCelebrantManagement = () => {
    // Logique de gestion des célébrants
    console.log('Gestion des célébrants');
  };

  const handlePasswordChange = () => {
    // Logique de changement de mot de passe
    console.log('Nouveau mot de passe:', newPassword);
    setShowPasswordDialog(false);
  };

  const handleEmailChange = () => {
    // Logique de changement d'email
    console.log('Nouvel email:', newEmail);
    setShowEmailDialog(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Administration</CardTitle>
          <CardDescription>Gérez les paramètres et les actions administratives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va supprimer définitivement l'historique des années écoulées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteHistory}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Gestion des célébrants */}
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleCelebrantManagement}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter ou supprimer un célébrant
          </Button>

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
                  <Input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    className="mt-4"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handlePasswordChange}>
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