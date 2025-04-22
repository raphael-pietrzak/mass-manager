import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownSearch } from '../../../components/DropdownSearch';
<<<<<<< HEAD
import { RotateCw } from 'lucide-react';
=======
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, RotateCw } from 'lucide-react';
>>>>>>> 36d366151b13142de5b4edec0d7e996e937b8f7e
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fr } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
<<<<<<< HEAD
import CalendarSelector from '../../../components/CalendarSelector';
=======
import { Intention } from '../../../api/intentionService';
import { formatDateForApi, formatDateForDisplay } from '../../../utils/dateUtils';
>>>>>>> 36d366151b13142de5b4edec0d7e996e937b8f7e

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
}

const IntentionForm: React.FC<IntentionFormProps> = ({
  formData,
  updateFormData,
  selectedDate,
  setSelectedDate,
  celebrantOptions,
  onRecurrenceClick,
  nextStep
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
            id="isForDeceased"
            checked={formData.isForDeceased}
            onCheckedChange={(checked: boolean | "indeterminate") => updateFormData({ isForDeceased: checked as boolean })}
          />
          <Label htmlFor="isForDeceased">
            Intention pour un défunt
          </Label>
        </div>

        {/* Intention */}
        <div className="space-y-2">
          <Label htmlFor="intention">
            Intention <span className="text-red-500">*</span>
          </Label>
          <Input
            id="intention"
            name="intention"
            value={formData.intention}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ intention: e.target.value })}
            required
            placeholder="Votre intention..."
          />
        </div>

        {/* Nombre de messes */}
        <div className="space-y-2">
          <Label htmlFor="massCount">Nombre de messes</Label>
          <div className="flex gap-4">
            <Input 
              id="massCount" 
              type="number" 
              min="1" 
              className="w-24"
              value={formData.massCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ massCount: parseInt(e.target.value) })}
            />
            <Select 
              onValueChange={(value: string) => updateFormData({ massType: value })}
              value={formData.massType}
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

        {/* Type de date */}
        <div className="space-y-4">
          <Label>Type de date</Label>
          <RadioGroup 
            value={formData.dateType}
            onValueChange={(value: string) => updateFormData({ dateType: value })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="indifferente" id="indifferente" />
              <Label htmlFor="indifferente">Indifférente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="souhaitee" id="souhaitee" />
              <Label htmlFor="souhaitee">Souhaitée</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imperative" id="imperative" />
              <Label htmlFor="imperative">Impérative</Label>
            </div>
          </RadioGroup>

          {/* Date avec conditionnelle pour l'affichage */}
          {formData.dateType !== "indifferente" && (
            <div className="flex items-end gap-2">
              <div className="flex-grow">
<<<<<<< HEAD
                <CalendarSelector
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                />
=======
                <Button
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setShowCalendar(!showCalendar);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    formatDateForDisplay(selectedDate)
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
                {showCalendar && (
                  <div className="absolute mt-2 p-2 bg-white border rounded-md shadow-lg z-10">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date: Date | undefined) => {
                        setSelectedDate(date);
                        // Convertir la date en chaîne de caractères au format YYYY-MM-DD
                        const dateString = formatDateForApi(date);
                        updateFormData({ date: dateString });
                        setShowCalendar(false);
                      }}
                      locale={fr}
                    />
                  </div>
                )}
>>>>>>> 36d366151b13142de5b4edec0d7e996e937b8f7e
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

        {/* Célébrant */}
        <div className="space-y-2">
          <Label>Célébrant</Label>
          <DropdownSearch
            options={celebrantOptions}
            value={formData.celebrant_id}
            onChange={(value: string) => updateFormData({ celebrant_id: value })}
            placeholder="Sélectionner un célébrant"
            defaultValue={formData.celebrant_id}
          />
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
