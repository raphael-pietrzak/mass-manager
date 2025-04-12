import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownSearch } from '../../components/DropdownSearch';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { CalendarIcon, RotateCw } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface IntentionFormProps {
  intention: string;
  selectedDate?: Date;
  selectedCelebrant: string;
  celebrantOptions: DropdownOption[];
  onIntentionChange: (value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onCelebrantChange: (value: string) => void;
  onRecurrenceClick: () => void;
  nextStep: () => void;
}

const IntentionForm: React.FC<IntentionFormProps> = ({
  intention,
  selectedDate,
  selectedCelebrant,
  celebrantOptions,
  onIntentionChange,
  onDateChange,
  onCelebrantChange,
  onRecurrenceClick,
  nextStep
}) => {
  return (
    <div className="flex flex-col flex-1 h-full min-h-[300px]">
      <div className="flex-grow space-y-6">
        {/* Intention */}
        <div className="space-y-2">
          <Label htmlFor="intention">
            Intention <span className="text-red-500">*</span>
          </Label>
          <Input
            id="intention"
            name="intention"
            value={intention}
            onChange={(e) => onIntentionChange(e.target.value)}
            required
            placeholder="Votre intention..."
          />
        </div>

        {/* Date avec Popover/Calendar et icônes */}
        <div className="flex items-end gap-2">
          <div className="flex-grow space-y-2">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                  id="date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'P', { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateChange}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
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

        {/* Célébrant */}
        <div className="space-y-2">
          <Label>Célébrant</Label>
          <DropdownSearch
            options={celebrantOptions}
            value={selectedCelebrant}
            onChange={onCelebrantChange}
            placeholder="Sélectionner un célébrant"
            defaultValue={selectedCelebrant}
          />
        </div>
      </div>

      <div className="mt-auto pt-6 flex justify-end">
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
