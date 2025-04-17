import { useEffect, useState } from 'react';
import { SpecialDays } from '../../api/specialDaysService';
import { specialDayService } from '../../api/specialDaysService';
import { formatDisplayDate } from '../../utils/dateUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecialDaysModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [specialDays, setSpecialDays] = useState<SpecialDays[]>([]);
  const [editingDay, setEditingDay] = useState<SpecialDays | null>(null);
  const [newDay, setNewDay] = useState<SpecialDays>({
    date: '',
    description: '',
    number_of_masses: 0,
    is_recurrent: false,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // To track which day is being deleted
  const [showSpecialDays, setShowSpecialDays] = useState(false); // For toggle show special days
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // For confirmation of deletion
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      loadSpecialDays();
    } else {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(undefined);
      }, 4000);
  
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  

  const loadSpecialDays = async () => {
    const data = await specialDayService.getSpecialDays();
    // On filtre ou remplace les valeurs vides par des valeurs par défaut
    const sanitizedData = data.map((day) => ({
      ...day,
      date: day.date || '',  // Si `date` est vide, on le remplace par une chaîne vide.
      description: day.description || '',  // Même chose pour la description.
      number_of_masses: day.number_of_masses || 0,  // Si `number_of_masses` est vide ou nul, on le remplace par 0.
      is_recurrent: day.is_recurrent ?? false,  // Si `is_recurrent` est nul, on le remplace par `false`.
    }));
    setSpecialDays(sanitizedData);  // Mettre à jour l'état avec les données nettoyées.
  };

  const handleChange = (field: keyof SpecialDays, value: any) => {
    setNewDay((prev: any) => ({
      ...prev,
      [field]: field === 'number_of_masses' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
      if (editingDay?.id) {
        const response = await specialDayService.updateSpecialDay(editingDay.id, newDay);
        setSuccessMessage(response);
      } else {
        const response = await specialDayService.createSpecialDays(newDay);
        setSuccessMessage(response);
      }
      await loadSpecialDays();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du jour spécial", error);
    }
  };

  const handleDelete = (id: string) => {
    setIsDeleting(id); // Save the ID of the day to delete
    setIsConfirmingDelete(true); // Display the confirmation message
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) {
      try {
        const response = await specialDayService.deleteSpecialDay(isDeleting);
        await loadSpecialDays(); // Recharge sans toucher au form
        resetForm(); // Réinitialise le formulaire après la suppression
        setIsDeleting(null);
        setSuccessMessage(response);
      } catch (error) {
        console.error('Erreur lors de la suppression du jour spécial', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false); // Cancel the deletion
    setIsDeleting(null); // Reset the deleting state
  };

  const handleEdit = (day: SpecialDays) => {
    setEditingDay(day);
    setNewDay({ ...day });
    
  };

  const formatDateWithoutYear = (date: string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
    return d.toLocaleDateString('fr-FR', options); // Format without year
  };

  const resetForm = () => {
    setEditingDay(null);
    setNewDay({ date: '', description: '', number_of_masses: 0, is_recurrent: false });
    setIsDeleting(null);
    setIsConfirmingDelete(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg relative max-h-[95vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white z-10 pb-4">      
          <div className="relative mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Jours Particuliers</h2>
            </div>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
            <div className="flex items-center justify-between mb-4">
                {/* Le bouton "+ Ajouter un jour" s'affiche uniquement si on est en mode édition (c'est-à-dire après avoir sélectionné un jour) */}
                {editingDay && (
                    <button
                    onClick={() => {
                        resetForm(); // Réinitialiser le formulaire pour revenir en mode ajout
                        setEditingDay(null); // Réinitialiser l'état d'édition
                    }}
                    className="px-4 py-2 text-black border border-gray-300 rounded hover:bg-gray-100"
                    >
                    + Ajouter un jour
                    </button>
                )}

                {/* Le bouton "Afficher la liste des jours" reste toujours aligné à droite */}
                <div className="flex items-center ml-auto">
                    <span className="mr-2">Afficher la liste des jours</span>
                    <input
                    type="checkbox"
                    checked={showSpecialDays}
                    onChange={() => setShowSpecialDays(!showSpecialDays)}
                    className="mr-2"
                    />
                </div>
            
            </div>

            {/* Toggle button to show/hide special days */}
            {/* Formulaire d'ajout / édition */}
            <form
            className="space-y-2 border-t pt-4"
            onSubmit={(e) => {
                e.preventDefault(); // Pour bloquer la soumission native
                handleSave();       // Ta logique de sauvegarde
            }}
            >
                <h3 className="text-lg font-semibold">{editingDay ? 'Modifier' : 'Ajouter'} un jour particulier</h3>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Date<span className="text-red-500"> *</span></span>
                    <input
                        type="date"
                        required
                        value={newDay.date}
                        onChange={e => handleChange('date', e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="block w-1/2">
                    <span className="text-sm font-medium text-gray-700">
                      Description<span className="text-red-500"> *</span>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="ex : Noël ou Jeudi Saint"
                      value={newDay.description}
                      onChange={e => handleChange('description', e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </label>

                  <label className="block w-1/2">
                    <span className="text-sm font-medium text-gray-700">
                      Nombre de messes (par célébrant)
                    </span>
                    <input
                      type="number"
                      required
                      value={newDay.number_of_masses ?? ''}
                      onChange={e => handleChange('number_of_masses', e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </label> 
                </div>
                <label className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    checked={newDay.is_recurrent ?? false}
                    onChange={e => handleChange('is_recurrent', e.target.checked)}
                    />
                    Récurrent (pour une date fixe)
                </label>
                <div className="flex gap-4 mt-4">
                    <button
                    type="submit" // ← crucial !
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                    {editingDay ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                    {editingDay && (
                    <button
                        type="button"
                        onClick={() => handleDelete(editingDay.id!)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Supprimer
                    </button>
                    )}
                </div>
                </form>


                {successMessage && (
                <div className="relative mb-4 mt-8 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md">
                  <button
                    onClick={() => setSuccessMessage(undefined)}
                    className="absolute top-1 right-2 text-green-700 hover:text-green-900"
                  >
                    ✕
                  </button>
                  {successMessage}
                </div>
              )}

            {/* Deletion Confirmation */}
            {isConfirmingDelete && (
            <div className="mb-4 mt-8 p-3 bg-red-50 border border-red-300 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert w-5 h-5 text-red-500">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                </svg>
                <p className="text-red-700 font-medium">Confirmer la suppression</p>
                </div>
                <p className="text-sm text-red-600 mb-3">Êtes-vous sûr de vouloir supprimer ce jour particulier ? Cette action est irréversible.</p>
                <div className="flex justify-end space-x-2">
                <button
                    onClick={handleCancelDelete} // Cancel the deletion
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                >
                    Annuler
                </button>
                <button
                    onClick={handleConfirmDelete} // Confirm deletion
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 rounded-md px-3"
                >
                    Supprimer
                </button>
                </div>
            </div>
            )}

        </div>

        {/* Show special days based on the checkbox */}
        {showSpecialDays && (
          <div className="space-y-3 border-t pt-8 overflow-y-auto flex-1 min-h-0">
            {specialDays.map(day => (
              <div
                key={day.id}
                className="flex justify-between items-center border p-3 rounded shadow-sm bg-gray-50 cursor-pointer"
                onClick={() => handleEdit(day)} // Modify on click of the day
              >
                <div>
                  <p className="font-medium">
                    {day.is_recurrent 
                      ? formatDateWithoutYear(day.date) // No year if recurrent
                      : formatDisplayDate(new Date(day.date).getTime()) // Normal date format with year
                    } - {day.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {day.number_of_masses} messe(s) — {day.is_recurrent ? 'Récurrent' : 'Unique'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
