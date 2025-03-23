import React from 'react';
import { X } from 'lucide-react';
import { Mass } from './types';

interface MassModalProps {
  mass: Mass | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: Mass) => void;
}

export const MassModal: React.FC<MassModalProps> = ({
  mass,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const defaultMass = mass || {
    id: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    celebrant: '',
    location: 'Main Chapel',
    type: 'basse',
    intention: '',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedMass: Mass = {
      ...defaultMass,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      celebrant: formData.get('celebrant') as string,
      location: formData.get('location') as string,
      type: formData.get('type') as 'basse' | 'chantée',
      intention: formData.get('intention') as string,
    };
    onSave(updatedMass);
  };

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
            <input
              type="text"
              name="celebrant"
              defaultValue={defaultMass.celebrant}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <select
              name="location"
              defaultValue={defaultMass.location}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="Main Chapel">Chapelle principale</option>
              <option value="Side Chapel">Chapelle latérale</option>
              <option value="Cathedral">Cathédrale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              defaultValue={defaultMass.type}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="basse">Messe basse</option>
              <option value="chantée">Messe chantée</option>
            </select>
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

          <div className="flex justify-end space-x-3 pt-4">
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
        </form>
      </div>
    </div>
  );
};