import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit, AlertTriangle, X } from 'lucide-react';
import { recurrenceService, Recurrence, RecurringIntentionSubmission } from '../api/recurrenceService';
import { formatDateForDisplay, parseApiDate } from '../utils/dateUtils';
import { toast } from 'sonner';
import { IntentionWithRecurrence, RecurringIntentionModal } from '../features/intentions/recurring/RecurringIntentionModal';
import RecurrenceDialog from '../components/RecurrenceDialog';
import { intentionService } from '../api/intentionService';

const RecurrencePage: React.FC = () => {
  const [recurringIntentions, setRecurringIntentions] = useState<IntentionWithRecurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState<IntentionWithRecurrence | null>(null);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [recurrenceToEdit, setRecurrenceToEdit] = useState<IntentionWithRecurrence | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [intentionToDelete, setIntentionToDelete] = useState<IntentionWithRecurrence | null>(null);

  useEffect(() => {
    loadRecurrences();
  }, []);

  const loadRecurrences = async () => {
    try {
      setLoading(true);
      const allRecurringIntentions = await recurrenceService.getAll();
      setRecurringIntentions(allRecurringIntentions);
    } catch (error) {
      console.error('Erreur lors du chargement des récurrences:', error);
      toast.error('Erreur lors du chargement des récurrences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewRecurringIntention = async (newIntention: RecurringIntentionSubmission) => {
    try {
      await recurrenceService.create(newIntention);
      await loadRecurrences()
    } catch (error) {
      console.error("Erreur lors de la création de l'intention récurrente", error);
    }
  };

  const handleCreateNew = () => {
    setEditingRecurrence(null);
    setDialogOpen(true);
  };

  const handleEdit = (recurrence: IntentionWithRecurrence) => {
    setRecurrenceToEdit(recurrence);
    setRecurrenceDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, intention: IntentionWithRecurrence) => {
    e.stopPropagation();
    setIntentionToDelete(intention);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (intentionToDelete && intentionToDelete.id) {
      try {
        await recurrenceService.delete(Number(intentionToDelete.recurrence_id));
        await loadRecurrences();
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

  const handleSave = async (formData: Partial<Recurrence>, localIntention: Partial<IntentionWithRecurrence>) => {
    try {
      setLoading(true);
      if (formData.recurrence_id && localIntention.id) {
        await recurrenceService.update(formData.recurrence_id, formData);
        await intentionService.updateMass(localIntention.id, {
          intention_text: localIntention.intention_text,
          deceased: localIntention.deceased,
        });
      }
      await loadRecurrences();
      setRecurrenceDialogOpen(false);
      setRecurrenceToEdit(null);
    } finally {
      setLoading(false);
    }

  };

  const getRecurrenceTypeLabel = (type: string) => {
    const labels = {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      relative_position: 'Position relative',
      yearly: 'Annuel'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getEndTypeLabel = (endType: string, recurrence: Recurrence) => {
    if (endType === 'occurrences') {
      return `${recurrence.occurrences} fois`;
    }
    if (endType === 'date' && recurrence.end_date) {
      return `Jusqu'au ${formatDateForDisplay(parseApiDate(recurrence.end_date))}`;
    }
    return endType;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Liste des intentions récurrences</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Chargement...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {recurringIntentions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Aucune intention récurrente trouvée
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Intention
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                        Date de début
                      </th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                        Fin
                      </th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                        Détails
                      </th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recurringIntentions.map((intention) => (
                      <tr
                        key={intention.recurrence_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2 max-w-[800px]">
                            {/* intention text tronqué */}
                            <span
                              className="truncate inline-block max-w-[500px] px-2 py-0.5 rounded-full text-s italic"
                              title={intention.intention_text} // Tooltip au survol
                            >
                              {intention.intention_text}
                            </span>

                            {/* badge défunt */}
                            {intention.deceased ? (
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                                Défunt
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            {getRecurrenceTypeLabel(intention.type)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {formatDateForDisplay(parseApiDate(intention.start_date))}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {getEndTypeLabel(intention.end_type, intention)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {intention.type === 'relative_position' && intention.position && intention.weekday && (
                            <span className="text-gray-600">
                              {intention.position} {intention.weekday}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(intention)}
                              className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors"
                              title="Modifier cette récurrence"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, intention)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                              title="Supprimer cette récurrence"
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
          </div>
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

        <RecurringIntentionModal
          intention={editingRecurrence}
          isOpen={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditingRecurrence(null);
          }}
          onSave={handleSaveNewRecurringIntention}
        />

        {recurrenceDialogOpen && (
          <RecurrenceDialog
            open={recurrenceDialogOpen}
            onOpenChange={setRecurrenceDialogOpen}
            recurrence={recurrenceToEdit}
            onSave={handleSave}
          />
        )}

        {!dialogOpen && (
          <button
            onClick={handleCreateNew}
            className="fixed bottom-6 right-6 p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 z-50"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </main>
    </div>
  );
};

export default RecurrencePage;
