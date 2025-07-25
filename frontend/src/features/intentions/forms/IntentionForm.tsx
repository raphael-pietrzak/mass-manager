import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownSearch } from '../../../components/DropdownSearch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import CalendarSelector from '../../../components/CalendarSelector';
import { Intention } from '../../../api/intentionService';
import { AlertDescription } from '../../../components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface IntentionFormProps {
  formData: Partial<Intention>;
  updateFormData: (data: Partial<Intention>) => void;
  selectedDate?: Date;
  setSelectedDate: (date: Date | undefined) => void;
  celebrantOptions: DropdownOption[];
  nextStep: () => void;
  unavailableDates?: string[]; // Nouvelles dates indisponibles du célébrant sélectionné
}

const IntentionForm: React.FC<IntentionFormProps> = ({
  formData,
  updateFormData,
  selectedDate,
  setSelectedDate,
  celebrantOptions,
  nextStep,
  unavailableDates = [] // Valeur par défaut comme tableau vide
}) => {

  const [errorIntentionText, setErrorIntentionText] = useState<string>();

  const handleNextStep = () => {
    if (!formData.intention_text || formData.intention_text.trim() === "") {
      setErrorIntentionText("L'intention est requise")
      return
    }
    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      if (unavailableDates.includes(selectedDateString)) {
        return;
      }
    } 
    setErrorIntentionText("")
    nextStep();
  };

  useEffect(() => {
    if (errorIntentionText) {
      const timer = setTimeout(() => {
        setErrorIntentionText("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorIntentionText]);

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-2 overflow-y-auto">

        {/* Intention */}
        <div className="space-y-2">
          <Label htmlFor="intention_text">
            Intention <span className="text-red-500">*</span>
          </Label>
          <Input
            id="intention_text"
            name="intention_text"
            value={formData.intention_text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ intention_text: e.target.value })}
            required
            placeholder="Votre intention..."
          />

          {errorIntentionText && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorIntentionText}</AlertDescription>
            </div>
          )}
        </div>

        {/* Type d'intention (défunt/vivant) */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="deceased"
            checked={formData.deceased}
            onCheckedChange={(checked: boolean | "indeterminate") => updateFormData({ deceased: checked as boolean })}
          />
          <Label htmlFor="deceased">
            Intention pour un défunt
          </Label>
        </div>

        {/* Nombre de messes */}
        <div className="space-y-2">
          <Label htmlFor="mass_count">Nombre de messes</Label>
          <div className="flex gap-4">
            <Input
              id="mass_count"
              type="number"
              min="1"
              className="w-24"
              value={formData.mass_count}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ mass_count: parseInt(e.target.value) })}
              disabled={formData.intention_type === "novena" || formData.intention_type === "thirty"}
            />
            <Select
              onValueChange={(value: string) => {
                let newMassCount = formData.mass_count;
                if (value === "novena") {
                  newMassCount = 9;
                } else if (value === "thirty") {
                  newMassCount = 30;
                } else {
                  newMassCount = 1;
                }
                updateFormData({ intention_type: value as "unit" | "novena" | "thirty", mass_count: newMassCount });
              }}
              value={formData.intention_type}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {
                    {
                      unit: "Unité",
                      novena: "Neuvaine",
                      thirty: "Trentain",
                    }[formData.intention_type || "unit"]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[
                  ["unit", "Unité"],
                  ["novena", "Neuvaine"],
                  ["thirty", "Trentain"],
                ].map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Célébrant */}
        <div className="space-y-2">
          <Label>Célébrant</Label>
          <DropdownSearch
            options={celebrantOptions}
            value={formData.celebrant_id}
            onChange={(value: string) => updateFormData({ celebrant_id: value })}
            placeholder="Sélectionner un célébrant"
          />
        </div>

        {/* Type de date */}
        <div className="space-y-4">
          <Label>Type de date</Label>
          <RadioGroup
            value={formData.date_type}
            onValueChange={(value: 'imperative' | 'desired' | 'indifferent') => updateFormData({ date_type: value })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="indifferent" id="indifferent" />
              <Label htmlFor="indifferent">Indifférente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="desired" id="desired" />
              <Label htmlFor="desired">Souhaitée</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imperative" id="imperative" />
              <Label htmlFor="imperative">Impérative</Label>
            </div>
          </RadioGroup>

          {/* Date avec conditionnelle pour l'affichage */}
          {formData.date_type !== "indifferent" && (
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <CalendarSelector
                  selectedDate={selectedDate}
                  onDateChange={(date: Date | undefined) => setSelectedDate(date)}
                  unavailableDates={unavailableDates}
                  position='top'
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleNextStep}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default IntentionForm;
