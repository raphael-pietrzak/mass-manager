import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarSelectorProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean; // si on veut empecher l'entrée du champ date
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  selectedDate,
  onDateChange,
  disabled = false
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCalendar(!showCalendar);
  };

  const handleSelect = (date: Date | undefined) => {
    onDateChange(date);
    setShowCalendar(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={toggleCalendar}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? (
          format(selectedDate, "P", { locale: fr })
        ) : (
          <span>Sélectionner une date</span>
        )}
      </Button>

      {showCalendar && (
        <div className="absolute mt-2 p-2 bg-white border rounded-md shadow-lg z-10">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={fr}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarSelector;
