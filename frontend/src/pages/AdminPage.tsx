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
import { Save, Trash2, UserPlus, Lock, Mail, Plus } from 'lucide-react';

const AdminPage = () => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showCelebrantDialog, setShowCelebrantDialog] = useState(false);
  const [celebrant, setCelebrant] = useState({
    religious_name: '',
    civil_firstname: '',
    civil_lastname: '',
    title: '',
    role: ''
  });

  // State for managing search and new celebrant
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCelebrants, setFilteredCelebrants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCelebrant, setNewCelebrant] = useState({
    religious_name: '',
    civil_firstname: '',
    civil_lastname: '',
    title: '',
    role: ''
  });

  const handleSave = () => {
    console.log('Sauvegarde effectuée');
  };

  const handleDeleteHistory = () => {
    console.log('Historique supprimé');
  };

  const handleCelebrantManagement = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCelebrant({ ...celebrant, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = () => {
    console.log('Nouveau mot de passe:', newPassword);
    setShowPasswordDialog(false);
  };

  const handleEmailChange = () => {
    console.log('Nouvel email:', newEmail);
    setShowEmailDialog(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter celebrants based on the search term
    if (term) {
      const filtered = celebrantsList.filter(celebrant =>
        celebrant.religious_name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCelebrants(filtered);
    } else {
      setFilteredCelebrants([]);
    }
  };

  const handleSelectCelebrant = (celebrant: any) => {
    console.log('Célébrant sélectionné:', celebrant);
    // Add logic for handling selected celebrant if needed
  };

  const handleAddCelebrantFormToggle = () => {
    setShowAddForm(!showAddForm);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCelebrant({ ...newCelebrant, [e.target.name]: e.target.value });
  };

  const handleAddCelebrant = () => {
    console.log('Ajouter un célébrant:', newCelebrant);
    // Add logic for saving the new celebrant
    setShowAddForm(false); // Hide form after adding
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
          <AlertDialog open={showCelebrantDialog} onOpenChange={setShowCelebrantDialog}>
            <AlertDialogTrigger asChild>
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter ou supprimer un célébrant
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ajouter ou supprimer un célébrant</AlertDialogTitle>
                <AlertDialogDescription>
                  Recherchez un célébrant ou ajoutez-en un nouveau.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3">
                {/* Champ de recherche avec autocomplétion */}
                <Input
                  placeholder="Rechercher un célébrant"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="flex-1"
                />
                
                {/* Affichage des résultats seulement si on commence à écrire */}
                {searchTerm && filteredCelebrants.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {filteredCelebrants.map((celebrant) => (
                      <div 
                        key={celebrant.id} 
                        className="p-2 bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => handleSelectCelebrant(celebrant)}
                      >
                        {celebrant.religious_name} {celebrant.civil_firstname}
                      </div>
                    ))}
                  </div>
                )}

                {/* Message si aucun résultat n'est trouvé */}
                {searchTerm && filteredCelebrants.length === 0 && (
                  <div className="p-2 text-gray-500">Aucun célébrant trouvé. Vous pouvez en ajouter un.</div>
                )}

                {/* Bouton pour ajouter un célébrant */}
                <Button 
                  className="bg-black text-white mt-3 p-3 rounded-full w-full"
                  onClick={handleAddCelebrantFormToggle}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un célébrant
                </Button>

                {/* Formulaire d'ajout du célébrant (visible lorsque showAddForm est true) */}
                {showAddForm && (
                  <div className="mt-4 space-y-4">
                    <Input
                      placeholder="Nom religieux"
                      name="religious_name"
                      value={newCelebrant.religious_name}
                      onChange={handleFormChange}
                    />
                    <Input
                      placeholder="Prénom civil"
                      name="civil_firstname"
                      value={newCelebrant.civil_firstname}
                      onChange={handleFormChange}
                    />
                    <Input
                      placeholder="Nom civil"
                      name="civil_lastname"
                      value={newCelebrant.civil_lastname}
                      onChange={handleFormChange}
                    />
                    <Input
                      placeholder="Titre"
                      name="title"
                      value={newCelebrant.title}
                      onChange={handleFormChange}
                    />
                    <Input
                      placeholder="Rôle"
                      name="role"
                      value={newCelebrant.role}
                      onChange={handleFormChange}
                    />
                    <Button onClick={handleAddCelebrant}>Ajouter le célébrant</Button>
                  </div>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
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
