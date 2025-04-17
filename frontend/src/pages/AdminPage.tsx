import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { celebrantService, Celebrant } from '../api/celebrantService';
import { DropdownSearch } from '../components/DropdownSearch';
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
import { Save, Trash2, UserPlus, Lock, Mail, Plus, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UNASSIGNED_VALUE = 'unassigned';

const AdminPage = () => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showCelebrantDialog, setShowCelebrantDialog] = useState(false);
  const [selectedCelebrant, setSelectedCelebrant] = useState<string>("unassigned");
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]); // Tableau pour stocker les célébrants récupérés
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);  // État pour afficher ou cacher le formulaire de mise à jour
  const [selectedCelebrantData, setSelectedCelebrantData] = useState<Celebrant | null>(null); // Informations du célébrants récupérées
  const [newCelebrant, setNewCelebrant] = useState({
    religious_name: '',
    civil_firstname: '',
    civil_lastname: '',
    title: '',
    role: ''
  });
  const celebrantOptions = celebrants.map((celebrant) => ({
    value: celebrant.id,
    label: `Père ${celebrant.religious_name} `
  }));
  const navigate = useNavigate();
  const [deleteBeforeDate, setDeleteBeforeDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // format 'YYYY-MM-DD'
  });

  // Charger les célébrants depuis l'API
  useEffect(() => {
    const fetchCelebrants = async () => {
      try {
        const data = await celebrantService.getCelebrants();
        setCelebrants(data); // Mettre à jour l'état avec les données récupérées
      } catch (error) {
        console.error("Erreur lors du chargement des célébrants:", error);
      }
    };

    fetchCelebrants(); // Appel de la fonction pour récupérer les données
  }, []);

  const handleSave = () => {
    console.log('Sauvegarde effectuée');
  };

  const handleDeleteHistory = (date: string) => {
    console.log('Historique supprimé avant la date:', date);
  };

  const handlePasswordChange = () => {
    console.log('Nouveau mot de passe:', newPassword);
    setShowPasswordDialog(false);
  };

  const handleEmailChange = () => {
    console.log('Nouvel email:', newEmail);
    setShowEmailDialog(false);
  };

  // Fonction pour ajouter un célébrant
  const handleAddCelebrant = () => {
    console.log('Ajouter un célébrant:', newCelebrant);
    // Logique d'envoi des données à l'API ici
    setShowAddForm(false); // Cacher le formulaire après ajout
  };

  // Fonction pour gérer les changements dans le formulaire d'ajout
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCelebrant({ ...newCelebrant, [e.target.name]: e.target.value });
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

          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => navigate('/database')}
          >
            <Database className="mr-2 h-4 w-4" />
            Base de données
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
          {/* Gestion des célébrants */}
          <AlertDialog open={showCelebrantDialog} onOpenChange={setShowCelebrantDialog}>
            <AlertDialogTrigger asChild>
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Gestion des célébrants
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-full max-w-lg mx-auto p-4 max-h-[95vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>Ajouter, supprimer ou mettre à jour un célébrant</AlertDialogTitle>
                <AlertDialogDescription>
                  Sélectionnez un célébrant dans la liste ou ajoutez-en un nouveau.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Célébrant
                </label>
                
                {/* DropdownSearch (barre de recherche avec sélection) */}
                <DropdownSearch
                  options={celebrantOptions}
                  value={selectedCelebrant}
                  // Mise à jour de l'état selectedCelebrant
                  onChange={(value) => {
                    setSelectedCelebrant(value);
                    const celebrant = celebrants.find(celebrant => celebrant.id === value);
                    if (celebrant) {
                      setSelectedCelebrantData(celebrant);
                      setShowUpdateForm(true); // Afficher le formulaire de mise à jour
                      setShowAddForm(false); // Cacher le formulaire d'ajout
                    } else {
                      setSelectedCelebrantData(null); // Si aucun célébrant n'est trouvé, on met à null
                      setShowUpdateForm(false); // Cacher le formulaire de mise à jour si aucun célébrant sélectionné
                    }
                  }} 
                  placeholder="Sélectionner un célébrant"
                  defaultValue={UNASSIGNED_VALUE}  // Valeur par défaut (non assigné)
                />

                

              </div>
              {/* Bouton pour ajouter un célébrant */}
              <Button 
                className="bg-black text-white mt-3 p-3 rounded-full w-full"
                onClick={() => { setShowAddForm(true); setShowUpdateForm(false); setSelectedCelebrant(""); }}
              >
                <Plus className="h-4 w-4" />
                Ajouter un célébrant
              </Button>

              {showUpdateForm && selectedCelebrantData && (
                <div className="mt-6 space-y-4">
                   <div>
                   <label htmlFor="religious_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom religieux
                    </label>
                    <Input
                      placeholder="Nom religieux"
                      name="religious_name"
                      value={selectedCelebrantData.religious_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSelectedCelebrantData({ ...selectedCelebrantData, religious_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                  <label htmlFor="civil_firstname" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom civil
                  </label>
                    <Input
                      placeholder="Prénom civil"
                      name="civil_firstname"
                      value={selectedCelebrantData.civil_first_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSelectedCelebrantData({ ...selectedCelebrantData, civil_first_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="civil_lastname" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom civil
                    </label>
                    <Input
                    placeholder="Nom civil"
                    name="civil_lastname"
                    value={selectedCelebrantData.civil_last_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSelectedCelebrantData({ ...selectedCelebrantData, civil_last_name: e.target.value })
                    }
                  />
                  </div>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <Input
                      placeholder="Titre"
                      name="title"
                      value={selectedCelebrantData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSelectedCelebrantData({ ...selectedCelebrantData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle
                    </label>
                    <Input
                      placeholder="Rôle"
                      name="role"
                      value={selectedCelebrantData.role}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSelectedCelebrantData({ ...selectedCelebrantData, role: e.target.value })
                      }
                    />
                  </div>
                  <Button className="w-full mt-3 bg-green-600 text-white">
                    Mettre à jour les informations
                  </Button>
                  <Button className="w-full mt-3 bg-red-600 text-white">
                    Supprimer le célébrant
                  </Button>
                </div>
              )}

              {/* Formulaire d'ajout du célébrant (affiché si showAddForm est true) */}
              {showAddForm && (
                <div className="mt-4 space-y-4">
                  <div>Formulaire d'ajout</div>
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
                  <Button onClick={handleAddCelebrant}>Ajouter</Button>
                </div>
              )}

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
