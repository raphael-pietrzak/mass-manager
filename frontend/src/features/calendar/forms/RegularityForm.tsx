import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormData {
  startDate: Date | null;
  recurrenceType: string;
  endType: 'occurrences' | 'date';
  occurrences: number;
  endDate: Date | null;
}

interface RegularityFormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onValidate: () => void;
}

const RegularityForm: React.FC<RegularityFormProps> = ({
  formData,
  updateFormData,
  onValidate
}) => {
  const recurrenceOptions = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'yearly', label: 'Annuel' }
  ];

  const getExplanation = () => {
    if (!formData.startDate || !formData.recurrenceType) return "Veuillez remplir les champs requis";

    let explanation = `Paiement ${formData.recurrenceType === 'daily' ? 'quotidien' :
      formData.recurrenceType === 'weekly' ? 'hebdomadaire' :
      formData.recurrenceType === 'monthly' ? 'mensuel' : 'annuel'}`;

    explanation += ` à partir du ${format(formData.startDate, 'P', { locale: fr })}`;

    if (formData.endType === 'occurrences') {
      explanation += ` pour ${formData.occurrences} occurrences`;
    } else if (formData.endDate) {
      explanation += ` jusqu'au ${format(formData.endDate, 'P', { locale: fr })}`;
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
              {formData.startDate ? (
                format(formData.startDate, 'P', { locale: fr })
              ) : (
                <span>Sélectionner une date</span>
              )}
            </Button>
          </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.startDate}
              onSelect={(date: Date | null) => updateFormData({ startDate: date })}
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
                {formData.endDate ? (
                  format(formData.endDate, 'P', { locale: fr })
                ) : (
                  <span>Sélectionner une date de fin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.endDate}
                onSelect={(date: Date | null) => updateFormData({ endDate: date })}
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