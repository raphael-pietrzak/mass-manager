import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDateForDisplay, formatDateForApi, parseApiDate } from '../../../utils/dateUtils';
import { Intention } from '../../../api/intentionService';
import CalendarSelector from '../../../components/CalendarSelector';

interface RegularityFormProps {
  formData: Partial<Intention>;
  updateFormData: (data: Partial<Intention>) => void;
  onValidate: () => void;
}

const RegularityForm: React.FC<RegularityFormProps> = ({
  formData,
  updateFormData,
  onValidate
}) => {
  // Convertir les chaînes de dates en objets Date pour l'interface utilisateur
  const startDate = formData.start_date ? parseApiDate(formData.start_date) : null;
  const endDate = formData.end_date ? parseApiDate(formData.end_date) : null;
  
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

  const getExplanation = () => {
    if (!startDate || !formData.recurrence_type) return "Veuillez remplir les champs requis";

    let explanation = "";
    
    switch(formData.recurrence_type) {
      case 'daily':
        explanation = ' Quotidien';
        break;
      case 'weekly':
        explanation = 'Hebdomadaire';
        break;
      case 'monthly':
        explanation = 'Mensuel';
        break;
      case 'yearly':
        explanation = 'Annuel';
        break;
      case 'relative_position':
        const position = positionOptions.find(p => p.value === formData.position)?.label || '?';
        const weekday = weekdayOptions.find(w => w.value === formData.weekday)?.label || '?';
        explanation = `Le ${position} ${weekday} de chaque mois`;
        break;
    }

    explanation += ` à partir du ${formatDateForDisplay(startDate)}`;

    if (formData.end_type === 'occurrences') {
      explanation += ` pour ${formData.occurrences} occurrences`;
    } else if (endDate) {
      explanation += ` jusqu'au ${formatDateForDisplay(endDate)}`;
    }

    return explanation;
  };

  // Affiche des champs additionnels en fonction du type de récurrence
  const renderRecurrenceTypeFields = () => {
    if (formData.recurrence_type === 'relative_position') {
      return (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={formData.position || ''}
              onValueChange={(value: string) => updateFormData({ position: value })}
            >
              <SelectTrigger className="w-full">
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
              onValueChange={(value: string) => updateFormData({ weekday: value })}
            >
              <SelectTrigger className="w-full">
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
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Date de début</Label>
        <CalendarSelector
          selectedDate={startDate ?? undefined}
          onDateChange={(date: Date | undefined) => {
            return updateFormData({ start_date: formatDateForApi(date) });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Type de récurrence</Label>
        <Select
          value={formData.recurrence_type || ''}
          onValueChange={(value: string) => updateFormData({ recurrence_type: value })}
        >
          <SelectTrigger className="w-full">
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

      {renderRecurrenceTypeFields()}

      <div className="space-y-2">
        <Label>Fin de la récurrence</Label>
        <RadioGroup
          value={formData.end_type || ''}
          onValueChange={(value: 'occurrences' | 'date') => 
            updateFormData({ end_type: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="occurrences" id="occurrences" />
            <Label htmlFor="occurrences">Après</Label>
            <Input
              type="number"
              min="1"
              value={formData.occurrences || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ 
                occurrences: parseInt(e.target.value) || 1 
              })}
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
          <CalendarSelector
            selectedDate={endDate ?? undefined}
            onDateChange={(date: Date | undefined) => {
              return updateFormData({ end_date: formatDateForApi(date) });
            }}
          />
        )}
      </div>

      <Alert>
        <AlertDescription>
          {getExplanation()}
        </AlertDescription>
      </Alert>

      <div className="pt-4">
        <Button type="button" className="w-full" onClick={onValidate}>
          Valider
        </Button>
      </div>
    </div>
  );
};

export default RegularityForm;