import React from 'react';
import { Mass } from './types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface MassListProps {
  masses: Mass[];
  onMassClick: (mass: Mass) => void;
  filters: {
    type: string;
    celebrant: string;
    location: string;
  };
}

export const MassList: React.FC<MassListProps> = ({ masses, onMassClick, filters }) => {
  const filteredMasses = masses.filter(mass => {
    return (
      (filters.type === 'all' || mass.type === filters.type) &&
      (filters.celebrant === 'all' || mass.celebrant === filters.celebrant) &&
      (filters.location === 'all' || mass.location === filters.location)
    );
  });

  return (
    <div className="space-y-4">
      {filteredMasses.map(mass => (
        <div
          key={mass.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onMassClick(mass)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium">
                {format(new Date(mass.date), 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              mass.type === 'basse' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {mass.type}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{mass.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{mass.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>{mass.celebrant}</span>
            </div>
          </div>
          
          {mass.intention && (
            <div className="mt-2 text-gray-600 italic">
              Intention: {mass.intention}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};