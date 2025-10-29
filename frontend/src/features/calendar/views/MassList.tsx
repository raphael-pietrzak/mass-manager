import React, { useState } from 'react';
import { Mass } from '../../../api/massService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, User, Trash2, AlertTriangle, X, Edit } from 'lucide-react';
import { MassModal } from '../MassModal';

interface MassListProps {
  masses: Mass[];
  onDeleteMass: (mass: Mass) => Promise<void>;
  onUpdateMass: (mass: Partial<Mass>) => void;
  filters: {
    celebrant: string;
    startDate: Date | null;
    endDate: Date | null;
    futureOnly: boolean;
  };
  loading: boolean;
}

export const MassList: React.FC<MassListProps> = ({ masses, onDeleteMass, onUpdateMass, filters, loading }) => {
  // État pour la modale de confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [massToDelete, setMassToDelete] = useState<Mass | null>(null);

  // État pour la modale d'édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMass, setSelectedMass] = useState<Mass | null>(null);

  // État pour la modale de détails
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailMass, setSelectedDetailMass] = useState<Mass | null>(null);

  const sortedMasses = [...masses].sort((a, b) =>
    new Date(a.date ?? '').getTime() - new Date(b.date ?? '').getTime()
  );

  const handleDeleteClick = (e: React.MouseEvent, mass: Mass) => {
    e.stopPropagation(); // Empêche la propagation du clic vers la ligne parent
    setMassToDelete(mass);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (massToDelete) {
      try {
        await onDeleteMass(massToDelete);
      } catch (err) {
        console.error("Erreur lors de la suppression :", err);
      } finally {
        setIsConfirmModalOpen(false);
        setMassToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setMassToDelete(null);
  };

  const handleMassClick = (mass: Mass) => {
    setSelectedMass(mass);
    setIsEditModalOpen(true);
  };

  const handleRowClick = (mass: Mass) => {
    setSelectedDetailMass(mass);
    setIsDetailsModalOpen(true);
  };

  const handleSaveMass = (updatedMass: Partial<Mass>) => {
    onUpdateMass(updatedMass);
    setIsEditModalOpen(false);
    setSelectedMass(null);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedMass(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : sortedMasses.length === 0 ? (
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
                  Statut
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de date
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Célébrant
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type d'intention
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
                  onClick={() => handleRowClick(mass)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                      <span>{format(new Date(mass.date ?? ''), 'EEE d MMM', { locale: fr })}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {(() => {
                      const statusConfig = {
                        scheduled: { label: 'Planifiée', color: 'bg-green-100 text-green-800' },
                        pending: { label: 'En attente', color: 'bg-green-100 text-green-800' },
                        completed: { label: 'Célébrée', color: 'bg-purple-100 text-purple-800' },
                        cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' }
                      };
                      const status = mass.status || 'scheduled';
                      const config = statusConfig[status];

                      return (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                          {config.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {(() => {
                      const dateTypeConfig = {
                        indifferent: { label: 'mobile', color: 'bg-blue-100 text-blue-800' },
                        imperative: { label: 'fixe', color: 'bg-red-100 text-red-800' },
                        desired: { label: 'fixe', color: 'bg-red-100 text-red-800' },
                      };
                      type DateTypeKey = keyof typeof dateTypeConfig;
                      const dateType: DateTypeKey = (mass.dateType === 'indifferent' || mass.dateType === 'imperative' || mass.dateType === 'desired')
                        ? mass.dateType
                        : 'indifferent';
                      const config = dateTypeConfig[dateType];
                      // Déterminer le suffixe à ajouter
                      let suffix = '';
                      if (mass.intention_type === "novena") {
                        suffix = ' (neuvaine)';
                      } else if (mass.intention_type === "thirty") {
                        suffix = ' (trentain)';
                      }
                      return (
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                            {config.label}
                          </span>
                          <span>{suffix}</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <User className="w-3 h-3 text-gray-400 mr-1.5" />
                      <span>{mass.celebrant_title} {mass.celebrant_religious_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {mass.deceased === 1 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                        Défunt
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 italic truncate max-w-xs">
                    {mass.intention}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMassClick(mass);
                        }}
                        className={`p-1 text-gray-400 rounded-full transition-colors ${(mass?.intention_type === "unit"
                          ? (mass?.random_celebrant === 1 || mass?.dateType === "indifferent")
                          : (mass?.intention_type == null && mass?.random_celebrant === 1))
                          ? "hover:text-blue-500 hover:bg-gray-100"
                          : "invisible"
                          }`}
                        title="Modifier cette messe"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, mass)}
                        className={`p-1 text-gray-400 rounded-full transition-colors ${mass.intention_type === "unit"
                          ? "hover:text-red-500 hover:bg-gray-100"
                          : "invisible"
                          }`}
                        title="Supprimer cette messe"
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

      {/* Modale de détails */}
      {isDetailsModalOpen && selectedDetailMass && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Détails de la messe</h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="flex items-center mt-1 gap-x-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  {format(new Date(selectedDetailMass.date ?? ''), 'EEEE d MMMM yyyy', { locale: fr })}
                  {selectedDetailMass.dateType === "imperative" || selectedDetailMass.dateType === "desired" ? (
                    <span className="px-2 py-0.5 rounded-full text-sm bg-red-100 text-gray-900">
                      Fixe
                    </span>
                  ) : <span className="px-2 py-0.5 rounded-full text-sm bg-blue-100 text-gray-900">
                    Mobile
                  </span>}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Célébrant</h3>
                <p className="flex items-center mt-1">
                  <User className="w-4 h-4 text-gray-600 mr-2" />
                  {selectedDetailMass.celebrant_title} {selectedDetailMass.celebrant_religious_name}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1">
                  {selectedDetailMass.intention_type === "novena" ? (
                    <span className="px-2 py-0.5 rounded-full text-sm bg-blue-200">
                      Neuvaine
                    </span>
                  ) : selectedDetailMass.intention_type === "thirty" ? (
                    <span className="px-2 py-0.5 rounded-full text-sm bg-gray-300">
                      Trentain
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-sm bg-blue-100 text-gray-900">
                      Unité
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Intention</h3>
                <p className="mt-1 text-gray-900 flex items-center gap-x-3">
                  <span>
                    {selectedDetailMass.intention}
                  </span>
                  {selectedDetailMass.deceased ? (
                    <span className="px-2 py-0.5 rounded-full text-sm bg-gray-100 text-gray-900">
                      Défunt
                    </span>
                  ) : ""}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Fermer
              </button>
              {(selectedDetailMass?.intention_type === "unit"
                ? (selectedDetailMass?.random_celebrant === 1 ||
                  selectedDetailMass?.dateType === "indifferent")
                : (selectedDetailMass?.intention_type == null &&
                  selectedDetailMass?.random_celebrant === 1))
                && (
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleMassClick(selectedDetailMass);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

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

      {/* Modale d'édition de messe */}
      <MassModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMass}
        mass={selectedMass}
      />
    </>
  );
};