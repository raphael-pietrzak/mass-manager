import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownSearch } from "../../components/DropdownSearch";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Celebrant, celebrantService } from '../../api/celebrantService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X } from "lucide-react";

const UNASSIGNED_VALUE = "unassigned";

interface CelebrantManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CelebrantManager = ({ open, onOpenChange }: CelebrantManagerProps) => {
  const [selectedCelebrant, setSelectedCelebrant] = useState<string | undefined>(UNASSIGNED_VALUE);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create'); // Ajout de l'état formMode
  //const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCelebrantData, setSelectedCelebrantData] = useState<Celebrant | null>(null);
  const [newCelebrant, setNewCelebrant] = useState({
    religious_name: '',
    civil_firstname: '',
    civil_lastname: '',
    title: '',
    role: ''
  });
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const celebrantOptions = celebrants.map((celebrant) => ({
    value: celebrant.id.toString(),
    label: `Père ${celebrant.religious_name}`
  }));

//   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewCelebrant({ ...newCelebrant, [e.target.name]: e.target.value });
//   };

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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
  
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const refreshCelebrants = async () => {
    try {
      const data = await celebrantService.getCelebrants();
      setCelebrants(data);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des célébrants:", error);
    }
  };

  // Fonction de mise à jour
  const handleUpdateCelebrant = async () => {
    if (selectedCelebrantData) {
      try {
        const response = await celebrantService.updateCelebrant(selectedCelebrantData);
        setSuccessMessage(response);
        await refreshCelebrants(); // Rafraîchit la liste des célébrants
      } catch (error) {
        console.error("Erreur lors de la mise à jour du célébrant", error);
      }
    }
  };

  const handleAddCelebrant = async () => {
    try {
        const response = await celebrantService.addCelebrant({ ...newCelebrant, id: 0 }); // Appel au service pour ajouter
        setSuccessMessage(response);
        await refreshCelebrants(); // Rafraîchit la liste des célébrants
        setNewCelebrant({ religious_name: '', civil_firstname: '', civil_lastname: '', title: '', role: '' }); // Réinitialise le formulaire
    } catch (error) {
        console.error("Erreur lors de l'ajout du célébrant", error);
    }
}

  // Fonction de suppression
  const handleDeleteCelebrant = async () => {
    if (selectedCelebrant) {
      try {
        const response = await celebrantService.deleteCelebrant(selectedCelebrant); // Appel au service pour supprimer
        setSuccessMessage(response);
        await refreshCelebrants(); // Rafraîchit la liste des célébrants
        setSelectedCelebrant(undefined); // Réinitialise la sélection
        setFormMode('create'); // Après la suppression, revenir en mode création
      } catch (error) {
        console.error("Erreur lors de la suppression du célébrant", error);
      }
    }
  };

  const handleSelectCelebrant = (value: string) => {
    setSelectedCelebrant(value);
    const celebrant = celebrants.find(c => c.id === Number(value));
    if (celebrant) {
      setSelectedCelebrantData(celebrant);
      setFormMode('edit'); // Passer en mode édition
    } else {
      setSelectedCelebrantData(null);
      setFormMode('create'); // Passer en mode création
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-lg mx-auto p-4 max-h-[95vh] overflow-y-auto">
      <AlertDialogHeader>
        <div className="flex justify-between items-center">
          <AlertDialogTitle className="text-lg font-semibold">
            {formMode === 'create' ? 'Ajouter un célébrant' : 'Mettre à jour un célébrant'}
          </AlertDialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-gray-500 hover:text-black"
            onClick={() => onOpenChange(false)}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <AlertDialogDescription className="mt-1 text-sm text-muted-foreground">
          {formMode === 'create'
            ? 'Ajoutez un nouveau célébrant ou sélectionnez-en un pour la mise à jour.'
            : 'Mettez à jour les informations du célébrant sélectionné.'}
        </AlertDialogDescription>
      </AlertDialogHeader>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Célébrant</label>
          <DropdownSearch
            options={celebrantOptions}
            value={selectedCelebrant}
            onChange={handleSelectCelebrant}
            placeholder="Sélectionner un célébrant"
            defaultValue={UNASSIGNED_VALUE}
          />
        </div>

        <Button
          className="bg-black text-white mt-3 p-3 rounded-full w-full"
          onClick={() => {
            setFormMode('create'); // Passer en mode création
            setSelectedCelebrant(""); // Réinitialiser la sélection
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un célébrant
        </Button>

        {/* Message de succès */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-300 text-green-800">
            <AlertTitle>✓ Succès</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Formulaire de création / édition */}
        {(formMode === 'create' || formMode === 'edit') && (
          <div className="mt-6 space-y-4">
            <div className="font-semibold text-lg">{formMode === 'create' ? 'Formulaire d\'ajout' : 'Formulaire de modification'}</div>

            <div>
              <label htmlFor="religious_name" className="block text-sm font-medium text-gray-700 mb-1">Nom religieux</label>
              <Input
                name="religious_name"
                value={formMode === 'edit' ? selectedCelebrantData?.religious_name : newCelebrant.religious_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (formMode === 'edit') {
                    setSelectedCelebrantData(selectedCelebrantData ? { ...selectedCelebrantData, religious_name: e.target.value } : null);
                  } else {
                    setNewCelebrant({ ...newCelebrant, religious_name: e.target.value });
                  }
                }}
                placeholder="Nom religieux"
              />
            </div>

            <div>
              <label htmlFor="civil_firstname" className="block text-sm font-medium text-gray-700 mb-1">Prénom civil</label>
              <Input
                name="civil_firstname"
                value={formMode === 'edit' ? selectedCelebrantData?.civil_firstname : newCelebrant.civil_firstname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (formMode === 'edit') {
                    setSelectedCelebrantData(selectedCelebrantData ? { ...selectedCelebrantData, civil_firstname: e.target.value } : null);
                  } else {
                    setNewCelebrant({ ...newCelebrant, civil_firstname: e.target.value });
                  }
                }}
                placeholder="Prénom civil"
              />
            </div>

            <div>
              <label htmlFor="civil_lastname" className="block text-sm font-medium text-gray-700 mb-1">Nom civil</label>
              <Input
                name="civil_lastname"
                value={formMode === 'edit' ? selectedCelebrantData?.civil_lastname : newCelebrant.civil_lastname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (formMode === 'edit') {
                    setSelectedCelebrantData(selectedCelebrantData ? { ...selectedCelebrantData, civil_lastname: e.target.value } : null);
                  } else {
                    setNewCelebrant({ ...newCelebrant, civil_lastname: e.target.value });
                  }
                }}
                placeholder="Nom civil"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <Input
                name="title"
                value={formMode === 'edit' ? selectedCelebrantData?.title : newCelebrant.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (formMode === 'edit') {
                    setSelectedCelebrantData(selectedCelebrantData ? { ...selectedCelebrantData, title: e.target.value } : null);
                  } else {
                    setNewCelebrant({ ...newCelebrant, title: e.target.value });
                  }
                }}
                placeholder="Titre"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <Input
                name="role"
                value={formMode === 'edit' ? selectedCelebrantData?.role : newCelebrant.role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (formMode === 'edit') {
                    setSelectedCelebrantData(selectedCelebrantData ? { ...selectedCelebrantData, role: e.target.value } : null);
                  } else {
                    setNewCelebrant({ ...newCelebrant, role: e.target.value });
                  }
                }}
                placeholder="Rôle"
              />
            </div>

            {formMode === 'create' ? (
              <Button className="w-full mt-3 bg-blue-600 text-white" onClick={() => {   
                handleAddCelebrant(); 
                setSelectedCelebrant(UNASSIGNED_VALUE); // Réinitialiser la sélection après l'ajout
              }}>
                Ajouter le célébrant
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button className="w-full mt-3 bg-green-600 text-white" onClick={handleUpdateCelebrant}>
                  Mettre à jour les informations
                </Button>
                <Button className="w-full mt-3 bg-red-600 text-white" onClick={handleDeleteCelebrant}>
                  Supprimer le célébrant
                </Button>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
