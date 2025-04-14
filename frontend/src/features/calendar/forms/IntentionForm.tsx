import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownSearch } from '../../../components/DropdownSearch';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { CalendarIcon, RotateCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [massType, setMassType] = useState("unite");
  const [massCount, setMassCount] = useState(1);
  const [dateType, setDateType] = useState("indifferente");
  const [showCalendar, setShowCalendar] = useState(false);

  const massTypes = [
    { value: "unite", label: "Unité" },
    { value: "neuvaine", label: "Neuvaine (9 messes)" },
    { value: "trentain", label: "Trentain (30 messes)" }
  ];

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onIntentionChange(e.target.value)}
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
              value={massCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMassCount(parseInt(e.target.value))}
            />
            <Select 
              onValueChange={(value: string) => setMassType(value)}
              value={massType}
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
            defaultValue="indifferente" 
            value={dateType}
            onValueChange={(value: string) => setDateType(value)}
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
          {dateType !== "indifferente" && (
            <div className="flex items-end gap-2">
              <div className="flex-grow">
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
                    format(selectedDate, 'P', { locale: fr })
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
                        onDateChange(date);
                        setShowCalendar(false);
                      }}
                      locale={fr}
                    />
                  </div>
                )}
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
