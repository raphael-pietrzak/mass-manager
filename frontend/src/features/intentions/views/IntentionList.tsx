import React, { useState, useEffect } from 'react';
import { intentionService, Intention, Masses } from '../../../api/intentionService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Calendar, Trash2, AlertTriangle, X, Info } from 'lucide-react';
import { IntentionMassesModal } from './IntentionMassesModal';

export const IntentionList: React.FC = () => {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null);
  const [associatedMasses, setAssociatedMasses] = useState<Masses[]>([]);
  const [showMassesModal, setShowMassesModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [intentionToDelete, setIntentionToDelete] = useState<Intention | null>(null);

  useEffect(() => {
    fetchIntentions();
  }, []);

  const fetchIntentions = async () => {
    try {
      setLoading(true);
      const data = await intentionService.getIntentions();
      setIntentions(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des intentions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIntentionClick = async (intention: Intention) => {
    try {
      setSelectedIntention(intention);
      if (intention.id) {
        const masses = await intentionService.getIntentionMasses(intention.id);
        setAssociatedMasses(masses);
        setShowMassesModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des messes associées:', error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, intention: Intention) => {
    e.stopPropagation();
    setIntentionToDelete(intention);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (intentionToDelete && intentionToDelete.id) {
      try {
        await intentionService.deleteMass(intentionToDelete.id);
        await fetchIntentions(); // Rafraîchir la liste
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
      setIsConfirmModalOpen(false);
      setIntentionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setIntentionToDelete(null);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Liste des intentions de messe</h1>
        
        {loading ? (
          <div className="text-center py-10">Chargement des intentions...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {intentions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune intention disponible
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donateur
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intention
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {intentions.map(intention => (
                    <tr 
                      key={intention.id} 
                      onClick={() => handleIntentionClick(intention)} 
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                          <span>
                            {intention.date 
                              ? format(new Date(intention.date), 'EEE d MMM', { locale: fr })
                              : "Non définie"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <User className="w-3 h-3 text-gray-400 mr-1.5" />
                          <span>{`${intention.firstName || ''} ${intention.lastName || ''}`}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {intention.isForDeceased && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                            Défunts
                          </span>
                        )}
                        {!intention.isForDeceased && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            Vivants
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 italic truncate max-w-xs">
                        {intention.intention || ""}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {intention.amount ? `${intention.amount}€` : ""}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIntentionClick(intention);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors"
                            title="Voir les messes associées"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(e, intention)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                            title="Supprimer cette intention"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal pour afficher les messes associées */}
      {showMassesModal && selectedIntention && (
        <IntentionMassesModal 
          intention={selectedIntention}
          masses={associatedMasses}
          onClose={() => setShowMassesModal(false)}
        />
      )}

      {/* Modale de confirmation de suppression */}
      {isConfirmModalOpen && intentionToDelete && (
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
                  <h4 className="text-lg font-medium">Supprimer cette intention ?</h4>
                  <p className="text-sm text-gray-500">
                    Cette action est irréversible. Toutes les informations liées à cette intention et ses messes associées seront définitivement supprimées.
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
