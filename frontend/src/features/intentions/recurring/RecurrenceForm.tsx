import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Recurrence } from '../../../api/recurrenceService';
import CalendarSelector from '../../../components/CalendarSelector';
import { formatDateForApi, parseApiDate } from '../../../utils/dateUtils';
import { IntentionWithRecurrence } from './RecurringIntentionModal';
import { AlertTriangle } from 'lucide-react';
import { AlertDescription } from '../../../components/ui/alert';


interface RecurrenceFormProps {
  recurrence: Partial<IntentionWithRecurrence>;
  updateRecurrence: (recurrence: Partial<IntentionWithRecurrence>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const RecurrenceForm: React.FC<RecurrenceFormProps> = ({
  recurrence,
  updateRecurrence,
  nextStep,
  prevStep
}) => {
  const [formData, setFormData] = useState<Partial<IntentionWithRecurrence>>(recurrence);
  const [errors, setErrors] = useState<{ start_date?: string; end_date?: string }>({});

  useEffect(() => {
    setFormData(recurrence);
  }, [recurrence]);

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

  const handleChange = (key: keyof Recurrence, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleValidate = () => {
    const newErrors: { start_date?: string; end_date?: string } = {};
    if (!formData.start_date) {
      newErrors.start_date = 'La date de début est requise';
    }
    if (formData.end_type === 'date' && !formData.end_date) {
      newErrors.end_date = 'La date de fin est requise';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    updateRecurrence(formData);
    nextStep();
  };

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-2 overflow-y-auto">
        <div className="space-y-2">
          <Label>Date de début</Label>
          <CalendarSelector
            selectedDate={formData.start_date ? parseApiDate(formData.start_date) : undefined}
            onDateChange={(date) => handleChange('start_date', formatDateForApi(date))}
            ignoreAvailability={false}
          />
          {errors.start_date && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.start_date}</AlertDescription>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Type de récurrence</Label>
          <Select
            value={formData.type || ''}
            onValueChange={(val: any) => handleChange('type', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner la récurrence" />
            </SelectTrigger>
            <SelectContent>
              {recurrenceOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.type === 'relative_position' && (
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={formData.position || ''}
              onValueChange={(val: any) => handleChange('position', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la position" />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Jour de la semaine</Label>
            <Select
              value={formData.weekday || ''}
              onValueChange={(val: any) => handleChange('weekday', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le jour" />
              </SelectTrigger>
              <SelectContent>
                {weekdayOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Fin de la récurrence</Label>
          <RadioGroup
            value={formData.end_type || ''}
            onValueChange={(val: 'occurrences' | 'date') => handleChange('end_type', val)}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="occurrences" id="occurrences" />
              <Label htmlFor="occurrences">Après</Label>
              <Input
                type="number"
                min={1}
                value={formData.occurrences || ''}
                onChange={(e: { target: { value: string; }; }) => handleChange('occurrences', parseInt(e.target.value))}
                className="w-20"
              />
              <Label>occurrences</Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem value="date" id="date" />
              <Label htmlFor="date">Jusqu’à une date</Label>
            </div>
          </RadioGroup>

          {formData.end_type === 'date' && (
            <CalendarSelector
              selectedDate={formData.end_date ? parseApiDate(formData.end_date) : undefined}
              onDateChange={(date) => handleChange('end_date', formatDateForApi(date))}
              ignoreAvailability={false}
            />
          )}
          {errors.end_date && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.end_date}</AlertDescription>
            </div>
          )}
        </div>
      </div>
      <div className="pt-6 flex justify-between space-x-4 border-t">
        <Button variant="outline" type="button" onClick={prevStep}>
          Précédent
        </Button>
        <Button type="button" onClick={handleValidate}>
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default RecurrenceForm;
