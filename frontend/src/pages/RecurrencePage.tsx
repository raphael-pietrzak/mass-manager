import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des Récurrences</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Récurrence
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recurrences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune récurrence trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurrences.map((recurrence) => (
                  <TableRow key={recurrence.id}>
                    <TableCell>
                      <Badge variant={getRecurrenceVariant(recurrence.type) as any}>
                        {getRecurrenceTypeLabel(recurrence.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateForDisplay(parseApiDate(recurrence.start_date))}
                    </TableCell>
                    <TableCell>
                      {getEndTypeLabel(recurrence.end_type, recurrence)}
                    </TableCell>
                    <TableCell>
                      {recurrence.type === 'relative_position' && recurrence.position && recurrence.weekday && (
                        <span className="text-sm text-gray-600">
                          {recurrence.position} {recurrence.weekday}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(recurrence)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(recurrence.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RecurrenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recurrence={editingRecurrence}
        onSave={handleSave}
      />
    </div>
  );
};

export default RecurrencePage;
