import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarSelectorProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean; // si on veut empecher l'entrée du champ date
  unavailableDates?: string[]; // Nouvelles dates indisponibles
  ignoreAvailability?: boolean; // si on veut donner la possibilités de choisir n'importe qu'elle date même dans le passé
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  selectedDate,
  onDateChange,
  disabled = false,
  unavailableDates = [],
  ignoreAvailability = false
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const today = startOfDay(new Date()); // Date d'aujourd'hui sans les heures, minutes, etc.

  const toggleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCalendar(!showCalendar);
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Ajuster la date en fonction du fuseau horaire local pour éviter un décalage
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      onDateChange(localDate); // Passer la date ajustée au parent
    }
    setShowCalendar(false);
  };

  // Fonction pour déterminer si une date est indisponible
  const isDateUnavailable = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return unavailableDates.includes(dateString);
  };

  // Fonction pour déterminer si une date est dans le passé
  const isDateInPast = (date: Date): boolean => {
    return isBefore(date, today);
  };

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);


  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        className={`w-full justify-start text-left font-normal ${selectedDate && isDateUnavailable(selectedDate) ? "border-red-500 text-red-500" : ""
          }`}
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
            defaultMonth={selectedDate || today}
            onSelect={handleSelect}
            locale={fr}
            captionLayout="dropdown-buttons"
            fromYear={2020}
            toYear={2100}
            disabled={(date: Date) => !ignoreAvailability && (isDateInPast(date) || isDateUnavailable(date))}
            modifiers={!ignoreAvailability ? {
              unavailable: (date: Date) => isDateUnavailable(date)
            } : undefined}
            modifiersClassNames={!ignoreAvailability ? {
              unavailable: "bg-red-100 text-red-600 hover:bg-red-200"
            } : undefined}
            classNames={{
              caption_label: "hidden",
              dropdown: "flex justify-center", // <-- Ajoute un espace entre mois et année
              dropdown_month: "rounded-md border bg-background text-sm px-2 py-1 font-bold",
              dropdown_year: "rounded-md border bg-background text-sm px-2 py-1 font-bold",
              day_disabled: "text-gray-300 cursor-not-allowed opacity-50",
            }}
            components={{
              IconLeft: () => <ChevronLeft className="h-4 w-4" />,
              IconRight: () => <ChevronRight className="h-4 w-4" />,
              Dropdown: (props: any) => (
                <select
                  {...props}
                  className="rounded-md border bg-background text-sm px-2 py-1 font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {props.children}
                </select>
              ),
            }}
          />
        </div>
      )}

      {selectedDate && !ignoreAvailability && isDateUnavailable(selectedDate) && (
        <p className="text-sm text-red-500 mt-1">Le célébrant est indisponible à cette date.</p>
      )}
    </div>
  );
};

export default CalendarSelector;
