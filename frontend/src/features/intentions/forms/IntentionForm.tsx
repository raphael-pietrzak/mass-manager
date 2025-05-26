import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownSearch } from '../../../components/DropdownSearch';
import { RotateCw } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import CalendarSelector from '../../../components/CalendarSelector';
import { Intention } from '../../../api/intentionService';

interface DropdownOption {
  value: string;
  label: string;
}

interface IntentionFormProps {
  formData: Intention;
  updateFormData: (data: Partial<Intention>) => void;
  selectedDate?: Date;
  setSelectedDate: (date: Date | undefined) => void;
  celebrantOptions: DropdownOption[];
  onRecurrenceClick: () => void;
  nextStep: () => void;
  unavailableDates?: string[]; // Nouvelles dates indisponibles du célébrant sélectionné
}

const IntentionForm: React.FC<IntentionFormProps> = ({
  formData,
  updateFormData,
  selectedDate,
  setSelectedDate,
  celebrantOptions,
  onRecurrenceClick,
  nextStep,
  unavailableDates = [] // Valeur par défaut comme tableau vide
}) => {

  const massTypes = [
    { value: "unite", label: "Unité" },
    { value: "neuvaine", label: "Neuvaine (9 messes)" },
    { value: "trentain", label: "Trentain (30 messes)" }
  ];

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-6 overflow-y-auto">
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
              disabled={formData.mass_type === "neuvaine" || formData.mass_type === "trentain"}
            />
            <Select 
              onValueChange={(value: string) => {
                // Mettre à jour automatiquement le nombre de messes en fonction du type
                let newMassCount = formData.mass_count;
                if (value === "neuvaine") {
                  newMassCount = 9;
                } else if (value === "trentain") {
                  newMassCount = 30;
                } else {
                  newMassCount = 1;
                }
                updateFormData({ mass_type: value, mass_count: newMassCount });
              }}
              value={formData.mass_type}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de messe" />
              </SelectTrigger>
              <SelectContent>
                {massTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
            onValueChange={(value: 'imperative' | 'preferred' | 'indifferent') => updateFormData({ date_type: value })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="indifferent" id="indifferent" />
              <Label htmlFor="indifferent">Indifférente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="preferred" id="preferred" />
              <Label htmlFor="preferred">Souhaitée</Label>
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
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onRecurrenceClick}
                title="Programmer une récurrence"
              >
                <RotateCw className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button
          type="button"
          onClick={nextStep}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default IntentionForm;
