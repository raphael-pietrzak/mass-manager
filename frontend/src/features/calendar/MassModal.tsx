import React, { useState, useEffect } from 'react';
import { Mass } from '../../api/massService';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { celebrantService, Celebrant } from '../../api/celebrantService';
import CalendarSelector from '../../components/CalendarSelector';

interface MassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: Mass) => void;
  mass: Mass | null;
}

export const MassModal: React.FC<MassModalProps> = ({ isOpen, onClose, onSave, mass }) => {
  const [editedMass, setEditedMass] = useState<Partial<Mass>>({});
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer la liste des célébrants
  useEffect(() => {
    const fetchCelebrants = async () => {
      try {
        setIsLoading(true);
        const data = await celebrantService.getCelebrants();

        // Vérifier que data est un tableau avant de le définir
        if (Array.isArray(data)) {
          setCelebrants(data);
        } else {
          console.error('Les données de célébrants ne sont pas un tableau:', data);
          setCelebrants([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des célébrants:', error);
        setCelebrants([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCelebrants();
    }
  }, [isOpen]);

  // Initialiser le formulaire avec les données de la masse sélectionnée
  useEffect(() => {
    if (mass) {
      setEditedMass({ ...mass });

      // Si un célébrant est déjà sélectionné, récupérer ses indisponibilités
      if (mass.celebrant_id) {
        fetchCelebrantAvailability(mass.celebrant_id);
      }
    } else {
      setEditedMass({});
    }
  }, [mass]);

  // Fonction pour récupérer les disponibilités d'un célébrant
  const fetchCelebrantAvailability = async (celebrantId: string) => {
    setIsLoading(true);
    try {
      const dates = await celebrantService.getUnavailableDates(celebrantId);
      setUnavailableDates(dates);
    } catch (error) {
      console.error('Erreur lors de la récupération des indisponibilités:', error);
      setUnavailableDates([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mass) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Si le célébrant change, réinitialiser la date et récupérer les nouvelles indisponibilités
    if (name === 'celebrant_id' && value !== editedMass.celebrant_id) {
      setEditedMass((prev) => ({
        ...prev,
        [name]: value,
        date: '', // Réinitialiser la date
      }));

      // Récupérer les indisponibilités du nouveau célébrant
      if (value) {
        fetchCelebrantAvailability(value);
      } else {
        setUnavailableDates([]);
      }
    } else {
      setEditedMass((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setEditedMass((prev) => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd'),
      }));
    } else {
      setEditedMass((prev) => ({
        ...prev,
        date: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedMass.id) {
      onSave(editedMass as Mass);
    }
  };

  // Vérifier si une date est indisponible
  const isDateUnavailable = (date: string) => {
    return unavailableDates.includes(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="font-medium">Modifier la messe</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="celebrant_id" className="block text-sm font-medium text-gray-700 mb-1">
                Célébrant
              </label>
              {isLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500">
                  Chargement...
                </div>
              ) : (
                <select
                  id="celebrant_id"
                  name="celebrant_id"
                  value={editedMass.celebrant_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Sélectionner un célébrant</option>
                  {Array.isArray(celebrants) ? (
                    celebrants.map((celebrant) => (
                      <option key={celebrant.id} value={celebrant.id}>
                        {celebrant.title} {celebrant.religious_name || `${celebrant.civil_firstname} ${celebrant.civil_lastname}`}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Erreur de chargement des célébrants</option>
                  )}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <CalendarSelector
                selectedDate={editedMass.date ? new Date(editedMass.date) : undefined}
                onDateChange={handleDateChange}
                disabled={!editedMass.celebrant_id}
                unavailableDates={unavailableDates}
              />
              {!editedMass.celebrant_id && (
                <p className="text-sm text-gray-500 mt-1">Veuillez d'abord sélectionner un célébrant</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              disabled={!!editedMass.date && isDateUnavailable(editedMass.date)}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
