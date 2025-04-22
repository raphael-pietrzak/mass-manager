import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDateForDisplay, formatDateForApi, parseApiDate } from '../../../utils/dateUtils';
import { Intention } from '../../../api/intentionService';

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
  const startDate = formData.startDate ? parseApiDate(formData.startDate) : null;
  const endDate = formData.endDate ? parseApiDate(formData.endDate) : null;
  
  const recurrenceOptions = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'yearly', label: 'Annuel' }
  ];

  const getExplanation = () => {
    if (!startDate || !formData.recurrenceType) return "Veuillez remplir les champs requis";

    let explanation = `Paiement ${formData.recurrenceType === 'daily' ? 'quotidien' :
      formData.recurrenceType === 'weekly' ? 'hebdomadaire' :
      formData.recurrenceType === 'monthly' ? 'mensuel' : 'annuel'}`;

    explanation += ` à partir du ${formatDateForDisplay(startDate)}`;

    if (formData.endType === 'occurrences') {
      explanation += ` pour ${formData.occurrences} occurrences`;
    } else if (endDate) {
      explanation += ` jusqu'au ${formatDateForDisplay(endDate)}`;
    }

    return explanation;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Date de début</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                formatDateForDisplay(startDate)
              ) : (
                <span>Sélectionner une date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date: Date | null) => {
                updateFormData({ startDate: formatDateForApi(date) });
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
          value={formData.recurrenceType}
          onValueChange={(value: string) => updateFormData({ recurrenceType: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner la récurrence" />
          </SelectTrigger>
          <SelectContent>
            {recurrenceOptions.map((option: { value: string; label: string }) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fin de la récurrence</Label>
        <RadioGroup
          value={formData.endType}
          onValueChange={(value: 'occurrences' | 'date') => 
            updateFormData({ endType: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="occurrences" id="occurrences" />
            <Label htmlFor="occurrences">Après</Label>
            <Input
              type="number"
              min="1"
              value={formData.occurrences}
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

        {formData.endType === 'date' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  formatDateForDisplay(endDate)
                ) : (
                  <span>Sélectionner une date de fin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date: Date | null) => {
                  updateFormData({ endDate: formatDateForApi(date) });
                }}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
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