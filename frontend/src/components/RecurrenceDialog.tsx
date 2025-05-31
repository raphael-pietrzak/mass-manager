import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { recurrenceService, Recurrence } from '../api/recurrenceService';
import { formatDateForDisplay, formatDateForApi, parseApiDate } from '../utils/dateUtils';
import { toast } from 'sonner';

interface RecurrenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurrence?: Recurrence | null;
  onSave: () => void;
}

const RecurrenceDialog: React.FC<RecurrenceDialogProps> = ({
  open,
  onOpenChange,
  recurrence,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Recurrence>>({
    type: 'weekly',
    end_type: 'occurrences',
    occurrences: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recurrence) {
      setFormData(recurrence);
    } else {
      setFormData({
        type: 'weekly',
        end_type: 'occurrences',
        occurrences: 1
      });
    }
  }, [recurrence, open]);

  const recurrenceOptions = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'relative_position', label: 'Position relative mensuelle' },
    { value: 'yearly', label: 'Annuel' }
  ];

  const positionOptions = [
    { value: 'first', label: '1er' },
    { value: 'second', label: '2ème' },
    { value: 'third', label: '3ème' },
    { value: 'fourth', label: '4ème' },
    { value: 'last', label: 'Dernier' },
  ];

  const weekdayOptions = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.start_date || !formData.end_type) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    if (formData.end_type === 'occurrences' && !formData.occurrences) {
      toast.error('Le nombre d\'occurrences est requis');
      return;
    }

    if (formData.end_type === 'date' && !formData.end_date) {
      toast.error('La date de fin est requise');
      return;
    }

    if (formData.type === 'relative_position' && (!formData.position || !formData.weekday)) {
      toast.error('Position et jour de la semaine requis pour la récurrence relative');
      return;
    }

    try {
      setLoading(true);
      
      if (recurrence?.id) {
        await recurrenceService.update(recurrence.id, formData);
        toast.success('Récurrence mise à jour avec succès');
      } else {
        await recurrenceService.create(formData as Omit<Recurrence, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Récurrence créée avec succès');
      }
      
      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la récurrence');
    } finally {
      setLoading(false);
    }
  };

  const startDate = formData.start_date ? parseApiDate(formData.start_date) : null;
  const endDate = formData.end_date ? parseApiDate(formData.end_date) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {recurrence ? 'Modifier la récurrence' : 'Nouvelle récurrence'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatDateForDisplay(startDate) : <span>Sélectionner une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date: Date | null) => {
                    setFormData({ ...formData, start_date: formatDateForApi(date) });
                  }}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Type de récurrence</Label>
            <Select
              value={formData.type || ''}
              onValueChange={(value: string) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la récurrence" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'relative_position' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={formData.position || ''}
                  onValueChange={(value: string) => setFormData({ ...formData, position: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Jour de la semaine</Label>
                <Select
                  value={formData.weekday || ''}
                  onValueChange={(value: string) => setFormData({ ...formData, weekday: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Fin de la récurrence</Label>
            <RadioGroup
              value={formData.end_type || ''}
              onValueChange={(value: 'occurrences' | 'date') => 
                setFormData({ ...formData, end_type: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occurrences" id="occurrences" />
                <Label htmlFor="occurrences">Après</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.occurrences || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, occurrences: parseInt(e.target.value) || 1 })}
                  className="w-20"
                />
                <Label>occurrences</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="date" />
                <Label htmlFor="date">À une date spécifique</Label>
              </div>
            </RadioGroup>

            {formData.end_type === 'date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatDateForDisplay(endDate) : <span>Sélectionner une date de fin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date: Date | null) => {
                      setFormData({ ...formData, end_date: formatDateForApi(date) });
                    }}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecurrenceDialog;
