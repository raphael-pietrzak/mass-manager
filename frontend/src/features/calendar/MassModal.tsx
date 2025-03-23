import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Mass } from './types';
import { DropdownSearch } from '../../components/DropdownSearch';
import { celebrantService, Celebrant } from '../../api/celebrantService';

interface MassModalProps {
  mass: Mass | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: Mass) => void;
  onDelete?: (mass: Mass) => void;
}

export const MassModal: React.FC<MassModalProps> = ({
  mass,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [selectedCelebrant, setSelectedCelebrant] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // État pour la confirmation
  
  // Valeur par défaut pour le célébrant non assigné
  const UNASSIGNED_VALUE = "unassigned";
  
  // Initialise les données par défaut
  const defaultMass = mass || {
    id: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    celebrant: UNASSIGNED_VALUE,
    location: 'Main Chapel',
    type: 'basse',
    intention: '',
  };
  
  // Met à jour l'état du célébrant sélectionné quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && mass) {
      setSelectedCelebrant(mass.celebrant || UNASSIGNED_VALUE);
    } else if (isOpen) {
      setSelectedCelebrant(UNASSIGNED_VALUE);
    }
    // Réinitialiser l'état de confirmation à chaque ouverture
    setShowDeleteConfirm(false);
  }, [isOpen, mass]);

  useEffect(() => {
    const fetchCelebrants = async () => {
      try {
        const data = await celebrantService.getCelebrants();
        setCelebrants(data);
      } catch (error) {
        console.error('Erreur lors du chargement des célébrants:', error);
      }
    };
    
    if (isOpen) {
      fetchCelebrants();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedMass: Mass = {
      ...defaultMass,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      celebrant: selectedCelebrant, // Utilise l'état local au lieu du formulaire
      location: formData.get('location') as string,
      type: formData.get('type') as 'basse' | 'chantée',
      intention: formData.get('intention') as string,
    };
    onSave(updatedMass);
  };

  const handleDelete = () => {
    if (mass && onDelete) {
      onDelete(mass);
    }
  };

  const celebrantOptions = [
    { value: UNASSIGNED_VALUE, label: "Aléatoire" },
    ...celebrants.map(c => ({
      value: c.id,
      label: c.religious_name || `${c.civil_first_name} ${c.civil_last_name}`
    }))
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mass ? 'Modifier la messe' : 'Ajouter une messe'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Boîte de dialogue de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">Confirmer la suppression</p>
            </div>
            <p className="text-sm text-red-600 mb-3">
              Êtes-vous sûr de vouloir supprimer cette messe ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={defaultMass.date}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure
              </label>
              <input
                type="time"
                name="time"
                defaultValue={defaultMass.time}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Célébrant
            </label>
            <DropdownSearch
              options={celebrantOptions}
              value={selectedCelebrant}
              onChange={(value) => setSelectedCelebrant(value)}
              placeholder="Sélectionner un célébrant"
              defaultValue={UNASSIGNED_VALUE}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intention (optionnel)
            </label>
            <textarea
              name="intention"
              defaultValue={defaultMass.intention}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-between space-x-3 pt-4">
            {/* Bouton de suppression, visible uniquement lors de la modification d'une messe existante */}
            {mass && mass.id && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            )}
            
            <div className="flex justify-end space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};