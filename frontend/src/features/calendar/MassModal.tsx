import React, { useState, useEffect } from 'react';
import { Mass } from '../../api/massService';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { celebrantService, Celebrant } from '../../api/celebrantService';
import CalendarSelector from '../../components/CalendarSelector';
import { specialDayService } from '../../api/specialDaysService';

interface MassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: Partial<Mass>) => void;
  mass?: Partial<Mass> | null;
}

export const MassModal: React.FC<MassModalProps> = ({ isOpen, onClose, onSave, mass }) => {
  const [editedMass, setEditedMass] = useState<Partial<Mass>>({});
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialDate, setInitialDate] = useState<string | null>(null);
  const [initialCelebrantId, setInitialCelebrantId] = useState<string | null>(null);

  const fetchAllCelebrants = async () => {
    try {
      const data = await celebrantService.getCelebrants()
      setCelebrants(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des célébrants:', error);
      setCelebrants([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Récupérer la liste des célébrants disponibles 
  const fetchAvailableCelebrants = async (selectedDate: string) => {
    try {
      setIsLoading(true);
      let data = await celebrantService.getAvailableCelebrants(selectedDate);
      if (!Array.isArray(data)) {
        data = [];
      }
      // Ajouter le célébrant initial seulement si la date sélectionnée est la date initiale
      if (
        selectedDate === initialDate &&
        initialCelebrantId &&
        !data.some(c => String(c.id) === String(initialCelebrantId))
      ) {
        try {
          const initialCelebrant = await celebrantService.getCelebrantById(initialCelebrantId);
          if (initialCelebrant) {
            data = [initialCelebrant, ...data];
          }
        } catch (err) {
          console.log("Impossible d'ajouter le célébrant initial à la liste :", err);
        }
      }
      setCelebrants(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des célébrants disponibles:', error);
      setCelebrants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialisation initialDate et initialCelebrantId dès que mass change
  useEffect(() => {
    if (mass) {
      setEditedMass({ ...mass });
      setInitialDate(mass.date ?? null);
      setInitialCelebrantId(String(mass.celebrant_id ?? ''));
    } else {
      setEditedMass({});
      setInitialDate(null);
      setInitialCelebrantId(null);
    }
  }, [mass]);

  useEffect(() => {
    if (initialDate && initialCelebrantId) {
      fetchAvailableCelebrants(initialDate);
    }
    else {
      fetchAllCelebrants()
    }
  }, [initialDate, initialCelebrantId]);

  useEffect(() => {
    if (initialCelebrantId && initialDate) {
      fetchCelebrantAvailability(initialCelebrantId, initialDate);
    }
  }, [initialCelebrantId, initialDate]);

  // Fonction pour récupérer les disponibilités d'un célébrant
  const fetchCelebrantAvailability = async (celebrantId: string, currentDate?: string) => {
    try {
      let dates: string[] = [];

      // Toujours récupérer les specialDays globales (number_of_masses = 0)
      const specialDays = await specialDayService.getSpecialDays({ number_of_masses: 0 });
      const specialDates = specialDays.map(specialDay => specialDay.date);

      // Récupérér les jours où chaque célébrant a une messe assignée (jour complet)
      const fullDates = await celebrantService.getFullDates()

      if (celebrantId) {
        const unavailableDates = await celebrantService.getUnavailableDates(celebrantId);
        dates = [...new Set([...unavailableDates, ...specialDates, ...fullDates])]; // fusion sans doublons
      } else {
        dates = [...new Set([...specialDates, ...fullDates])];
      }
      setUnavailableDates(dates);
      // Vérifier si la date actuelle est disponible
      setEditedMass((prev) => {
        const isInitial =
          String(celebrantId) === String(initialCelebrantId) &&
          currentDate === initialDate;

        if (currentDate && dates.includes(currentDate) && !isInitial) {
          return { ...prev, date: '' };
        }
        return prev;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des dates indisponibles:', error);
      setUnavailableDates([]);
    }
  };

  if (!isOpen || !mass) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'celebrant_id' && value !== editedMass.celebrant_id) {
      setEditedMass((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Toujours récupérer les indisponibilités, même si pas de célébrant
      fetchCelebrantAvailability(value || '', editedMass.date ?? '');
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      setEditedMass((prev) => ({
        ...prev,
        date: formattedDate,
      }));
      // Recharger la liste filtrée des célébrants
      fetchAvailableCelebrants(formattedDate);

      // Recharger les indispos du célébrant sélectionné (s'il y en a un)
      if (editedMass.celebrant_id) {
        fetchCelebrantAvailability(editedMass.celebrant_id, formattedDate);
      }
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
                  {Array.isArray(celebrants) && celebrants.length > 0 ? (
                    celebrants.map((celebrant) => (
                      <option key={celebrant.id} value={celebrant.id}>
                        {celebrant.title} {celebrant.religious_name || `${celebrant.civil_firstname} ${celebrant.civil_lastname}`}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Aucun célébrant disponible à cette date</option>
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
                unavailableDates={unavailableDates}
                disabled={(editedMass.dateType !== "indifferent" || editedMass.status === "pending")}
              />
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