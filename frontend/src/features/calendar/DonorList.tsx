import React from 'react';
import { Mass } from './types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User } from 'lucide-react';

interface MassListProps {
  masses: Mass[];
  onMassClick: (mass: Mass) => void;
  filters: {
    celebrant: string;
    startDate: Date | null;
    endDate: Date | null;
    futureOnly: boolean;
  };
}

export const MassList: React.FC<MassListProps> = ({ masses, onMassClick, filters }) => {
  const filteredMasses = masses.filter(mass => {
    const massDate = new Date(mass.date);
    
    // Filter by celebrant
    const celebrantMatch = filters.celebrant === 'all' || mass.celebrant === filters.celebrant;
    
    // Filter by date range
    const startDateMatch = !filters.startDate || massDate >= filters.startDate;
    const endDateMatch = !filters.endDate || massDate <= filters.endDate;
    
    // Filter future only
    const futureMatch = !filters.futureOnly || massDate >= new Date(new Date().setHours(0, 0, 0, 0));
    
    return celebrantMatch && startDateMatch && endDateMatch && futureMatch;
  });

  // Trier les messes par date
  const sortedMasses = [...filteredMasses].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedMasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          Aucune messe ne correspond à ces critères
        </div>
      ) : (
        sortedMasses.map(mass => (
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
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{mass.time}</span>
              </div>
              <div className="flex items-center space-x-2">
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
        ))
      )}
    </div>
  );
};