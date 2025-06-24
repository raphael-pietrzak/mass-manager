import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit } from 'lucide-react';
import { recurrenceService, Recurrence } from '../api/recurrenceService';
import RecurrenceDialog from '../components/RecurrenceDialog';
import { formatDateForDisplay, parseApiDate } from '../utils/dateUtils';
import { toast } from 'sonner';

const RecurrencePage: React.FC = () => {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState<Recurrence | null>(null);

  useEffect(() => {
    loadRecurrences();
  }, []);

  const loadRecurrences = async () => {
    try {
      setLoading(true);
      const data = await recurrenceService.getAll();
      setRecurrences(data);
    } catch (error) {
      console.error('Erreur lors du chargement des récurrences:', error);
      toast.error('Erreur lors du chargement des récurrences');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRecurrence(null);
    setDialogOpen(true);
  };

  const handleEdit = (recurrence: Recurrence) => {
    setEditingRecurrence(recurrence);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette récurrence ?')) {
      return;
    }

    try {
      await recurrenceService.delete(id);
      await loadRecurrences();
      toast.success('Récurrence supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la récurrence');
    }
  };

  const handleSave = async () => {
    await loadRecurrences();
    setDialogOpen(false);
    setEditingRecurrence(null);
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

  const getRecurrenceVariant = (type: string) => {
    const variants = {
      daily: 'default',
      weekly: 'secondary',
      monthly: 'outline',
      relative_position: 'destructive',
      yearly: 'default'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Liste des récurrences</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Chargement...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {recurrences.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Aucune récurrence trouvée
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                    {recurrences.map((recurrence) => (
                      <tr
                        key={recurrence.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            {getRecurrenceTypeLabel(recurrence.type)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {formatDateForDisplay(parseApiDate(recurrence.start_date))}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {getEndTypeLabel(recurrence.end_type, recurrence)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {recurrence.type === 'relative_position' && recurrence.position && recurrence.weekday && (
                            <span className="text-gray-600">
                              {recurrence.position} {recurrence.weekday}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(recurrence)}
                              className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors"
                              title="Modifier cette récurrence"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(recurrence.id!)}
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
        
        <RecurrenceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          recurrence={editingRecurrence}
          onSave={handleSave}
        />

        {!dialogOpen && (
          <button
            onClick={handleCreate}
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
