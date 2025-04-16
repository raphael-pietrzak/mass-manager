import React, { useState } from 'react';
import { Mass } from '../../../api/massService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, User, Trash2, AlertTriangle, X } from 'lucide-react';

interface MassListProps {
  masses: Mass[];
  onMassClick: (mass: Mass) => void;
  onDeleteMass: (mass: Mass) => void;
  filters: {
    celebrant: string;
    startDate: Date | null;
    endDate: Date | null;
    futureOnly: boolean;
  };
}

export const MassList: React.FC<MassListProps> = ({ masses, onMassClick, onDeleteMass, filters }) => {
  // État pour la modale de confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [massToDelete, setMassToDelete] = useState<Mass | null>(null);

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

  const handleDeleteClick = (e: React.MouseEvent, mass: Mass) => {
    e.stopPropagation(); // Empêche la propagation du clic vers la ligne parent
    setMassToDelete(mass);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (massToDelete) {
      onDeleteMass(massToDelete);
      setIsConfirmModalOpen(false);
      setMassToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setMassToDelete(null);
  };

  return (
    <>
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
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button 
                        onClick={(e) => handleDeleteClick(e, mass)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                        title="Supprimer cette messe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale de confirmation de suppression */}
      {isConfirmModalOpen && massToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-medium">Confirmer la suppression</h3>
              <button 
                onClick={cancelDelete} 
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">Supprimer cette messe ?</h4>
                  <p className="text-sm text-gray-500">
                    Cette action est irréversible. Toutes les informations liées à cette messe seront définitivement supprimées.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4 flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};