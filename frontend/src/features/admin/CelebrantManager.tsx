import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownSearch } from "../../components/DropdownSearch";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Plus } from "lucide-react";
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
    title: 'P',
    role: ''
  });
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const celebrantOptions = celebrants.map((celebrant) => ({
    value: celebrant.id.toString(),
    label: `${celebrant.title} ${celebrant.religious_name}`
  }));

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

  useEffect(() => {
    if (!open) {
      // Réinitialiser les valeurs lorsque la modal est fermée
      setSelectedCelebrant(UNASSIGNED_VALUE);
      setFormMode('create');
      setSelectedCelebrantData(null);
      setNewCelebrant({
        religious_name: '',
        civil_firstname: '',
        civil_lastname: '',
        title: 'P',
        role: ''
      });
      setValidationError(null); // Réinitialiser l'erreur de validation
      setSuccessMessage(null); // Réinitialiser le message de succès
    }
  }, [open]); // Cette fonction s'exécute chaque fois que l'état 'open' change


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
    if (!newCelebrant.religious_name.trim()) {
      setValidationError("Le nom religieux est obligatoire");
      return;
    }
    if (!newCelebrant.civil_lastname.trim()) {
      setValidationError("Le nom civil est obligatoire");
      return;
    }
    if (!newCelebrant.civil_firstname.trim()) {
      setValidationError("Le prénom civil est obligatoire");
      return;
    }
    if (!newCelebrant.title.trim()) {
      setValidationError("Le titre est obligatoire (P, RP, TRP...)");
      return;
    }
    // Réinitialiser l'erreur si validation OK
    setValidationError(null);
    try {
      const response = await celebrantService.addCelebrant({ ...newCelebrant, id: '' }); // Appel au service pour ajouter
      setSuccessMessage(response);
      await refreshCelebrants(); // Rafraîchit la liste des célébrants
      setNewCelebrant({ religious_name: '', civil_firstname: '', civil_lastname: '', title: '', role: '' }); // Réinitialise le formulaire
    } catch (error) {
      console.error("Erreur lors de l'ajout du célébrant", error);
    }
  }

  const handleDeleteCelebrant = (id: string) => {
    setIsDeleting(id);
    setIsConfirmingDelete(true);
  };

  // Fonction de suppression
  const handleConfirmDeleteCelebrant = async () => {
    if (selectedCelebrant && isDeleting) {
      try {
        const response = await celebrantService.deleteCelebrant(selectedCelebrant); // Appel au service pour supprimer
        setSuccessMessage(response);
        await refreshCelebrants(); // Rafraîchit la liste des célébrants
        setSelectedCelebrant(undefined); // Réinitialise la sélection
        setFormMode('create'); // Après la suppression, revenir en mode création
        setIsDeleting(null);
        setIsConfirmingDelete(false);
      } catch (error) {
        console.error("Erreur lors de la suppression du célébrant", error);
      }
    }
  };

  const handleCloseConfirmDelete = () => {
    setIsConfirmingDelete(false); // Ferme la fenêtre de confirmation
  };

  const handleSelectCelebrant = (value: string) => {
    setSelectedCelebrant(value);
    const celebrant = celebrants.find(c => c.id.toString() === value);
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

        {/* Message d'erreur */}
        {validationError && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Delete confirmation */}
        {isConfirmingDelete && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Confirmer la suppression</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">Êtes-vous sûr de vouloir supprimer ce célébrant (Les intentions de messe qui lui sont affectées seront réattribuées aléatoirement) ? Cette action est irréversible.</p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCloseConfirmDelete}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDeleteCelebrant}
                >
                  Supprimer
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Formulaire de création / édition */}
        {(formMode === 'create' || formMode === 'edit') && (
          <div className="mt-6 space-y-4">
            <div className="font-semibold text-lg">{formMode === 'create' ? 'Formulaire d\'ajout' : 'Formulaire de modification'}</div>

            <div>
              <label htmlFor="religious_name" className="block text-sm font-medium text-gray-700 mb-1">Nom religieux<span className="text-red-500"> *</span></label>
              <Input
                required
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
                className={validationError && !newCelebrant.religious_name.trim() ? "border-red-500" : ""}
              />
            </div>

            <div>
              <label htmlFor="civil_firstname" className="block text-sm font-medium text-gray-700 mb-1">Prénom civil<span className="text-red-500"> *</span></label>
              <Input
                required
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
                className={validationError && !newCelebrant.civil_firstname.trim() ? "border-red-500" : ""}
              />
            </div>

            <div>
              <label htmlFor="civil_lastname" className="block text-sm font-medium text-gray-700 mb-1">Nom civil<span className="text-red-500"> *</span></label>
              <Input
                required
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
                className={validationError && !newCelebrant.civil_lastname.trim() ? "border-red-500" : ""}
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre<span className="text-red-500"> *</span></label>
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
                className={validationError && !newCelebrant.title.trim() ? "border-red-500" : ""}
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
