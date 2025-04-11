import React from 'react';
import { Mass } from '../../api/massService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, User } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {sortedMasses.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Aucune messe ne correspond à ces critères
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Célébrant
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intention
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMasses.map(mass => (
              <tr 
                key={mass.id} 
                onClick={() => onMassClick(mass)} 
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                    <span>{format(new Date(mass.date), 'EEE d MMM', { locale: fr })}</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <User className="w-3 h-3 text-gray-400 mr-1.5" />
                    <span>{mass.celebrant}</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {mass.type === 'defunts' && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      Défunts
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 italic truncate max-w-xs">
                  {mass.intention}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};