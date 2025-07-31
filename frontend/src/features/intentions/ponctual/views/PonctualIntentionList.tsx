import React, { useState, useEffect, useMemo } from 'react';
import { intentionService, Intention, Masses } from '../../../../api/intentionService';
import { User, Trash2, AlertTriangle, X, Info } from 'lucide-react';
import { IntentionMassesModal } from './IntentionMassesModal';

interface IntentionListProps {
  onSelectionChange?: (ids: string[]) => void;
  intentions: Intention[];
  onRefresh: () => void;
  loading: boolean;
  status: string;
};

export const PonctualIntentionList: React.FC<IntentionListProps> = ({ intentions, onSelectionChange, onRefresh, loading, status }) => {
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null);
  const [associatedMasses, setAssociatedMasses] = useState<Masses[]>([]);
  const [showMassesModal, setShowMassesModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [intentionToDelete, setIntentionToDelete] = useState<Intention | null>(null);
  const [selectedIntentionId, setSelectedIntentionId] = useState<string[]>([]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedIntentionId);
    }
  }, [selectedIntentionId]);

  useEffect(() => {
    // Garde uniquement les IDs qui sont encore présents dans la liste intentions
    setSelectedIntentionId((prevSelected) =>
      prevSelected.filter((id) => intentions.some((intention) => intention.id === id))
    );
  }, [intentions]);

  const isAllSelected = useMemo(
    () => intentions.length > 0 && selectedIntentionId.length === intentions.length,
    [intentions, selectedIntentionId]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIntentionId(intentions.map((i) => i.id));
    } else {
      setSelectedIntentionId([]);
    }
  };

  const handleSelectIntention = (id: string, checked: boolean) => {
    setSelectedIntentionId((prev) =>
      checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
    );
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
        onRefresh()
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
      <div className="bg-white rounded-lg shadow p-4 mb-6">

        {loading ? (
          <div className="text-center py-10">Chargement...</div>
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
                    <th
                      scope="col"
                      className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3"
                    >
                      Intention
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left w-1/6">
                      Type
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left w-1/5">
                      Donateur
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left w-1/5">
                      Montant
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left w-1/5">
                      Actions
                    </th>
                    {status === 'pending' && (
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left w-1/5">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors duration-150 ease-in-out focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Sélectionner tout</span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {intentions.map(intention => (
                    <tr
                      key={intention.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-90 truncate max-w-xs">
                        <div className="flex ">
                          <span className='italic truncate'>{intention.intention_text}</span>
                          {intention.deceased ? (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                              Défunt
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {intention.intention_type === "unit" ? (
                          <>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                              Unité
                            </span>
                            {intention.number_of_masses !== 1 && (
                              <span className="ml-1 text-black text-xs">
                                ({intention.number_of_masses} messes)
                              </span>
                            )}
                          </>
                        ) : intention.intention_type === "thirty" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            Trentain
                          </span>
                        ) : intention.intention_type === "novena" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            Neuvaine
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <User className="w-3 h-3 text-gray-400 mr-1.5" />
                          <span>{`${intention.donor_firstname || ''} ${intention.donor_lastname || ''}`}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {intention.amount ? `${intention.amount}€` : ""}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleIntentionClick(intention)}
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
                      {status === 'pending' && (
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors duration-150 ease-in-out focus:ring-0 focus:ring-offset-0"
                            checked={selectedIntentionId.includes(intention.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleSelectIntention(intention.id, e.target.checked)}
                          />
                        </td>
                      )}
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
