import React from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Mass } from './types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DaySliderProps {
  date: string | null;
  masses: Mass[];
  isOpen: boolean;
  onClose: () => void;
  onMassClick: (mass: Mass) => void;
}

export const DaySlider: React.FC<DaySliderProps> = ({
  date,
  masses,
  isOpen,
  onClose,
  onMassClick,
}) => {
  if (!isOpen || !date) return null;

  const dayMasses = masses.filter(mass => mass.date === date);
  const formattedDate = format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity z-30"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 z-40">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">{formattedDate}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {dayMasses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune messe programmée pour ce jour
              </p>
            ) : (
              <div className="space-y-4">
                {dayMasses.map(mass => (
                  <div
                    key={mass.id}
                    onClick={() => onMassClick(mass)}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{mass.time}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          mass.type === 'basse'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {mass.type === 'basse' ? 'Basse' : 'Chantée'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Célébrant: {mass.celebrant}
                      </p>
                      <p className="text-sm text-gray-600">
                        Lieu: {mass.location}
                      </p>
                      {mass.intention && (
                        <p className="text-sm text-gray-600 italic">
                          Intention: {mass.intention}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};