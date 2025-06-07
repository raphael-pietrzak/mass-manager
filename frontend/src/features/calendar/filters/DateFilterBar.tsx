import React, { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import CalendarSelector from '../../../components/CalendarSelector';
import { Calendar1, CalendarArrowUp, CalendarDays, CalendarRange, CalendarSearch } from 'lucide-react';

interface DateFilterBarProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
  startDate: Date | null;
  endDate: Date | null;
  onExport?: (format: 'excel' | 'pdf' | 'word') => Promise<void>;
};

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  onFilterChange,
  startDate: currentStartDate,
  endDate: currentEndDate,
  onExport
}) => {
  const defaultStartDate = currentStartDate || startOfMonth(addMonths(new Date(), 1));
  const defaultEndDate = currentEndDate || endOfMonth(addMonths(new Date(), 1));

  const [showDatePickers, setShowDatePickers] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node) &&
        !startCalendarRef.current?.contains(event.target as Node) &&
        !endCalendarRef.current?.contains(event.target as Node)) {
        setShowDatePickers(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef, startCalendarRef, endCalendarRef, datePickerRef]);

  // Appeler onFilterChange au montage si aucune date n'est définie
  useEffect(() => {
    if (!currentStartDate && !currentEndDate) {
      onFilterChange(defaultStartDate, defaultEndDate);
    }
  }, []);

  const handleThisWeekClick = () => {
    const today = new Date();
    setStartDate(startOfWeek(today, { locale: fr }));
    setEndDate(endOfWeek(today, { locale: fr }));
    onFilterChange(startOfWeek(today, { locale: fr }), endOfWeek(today, { locale: fr }));
  };

  const handleThisMonthClick = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(endOfMonth(new Date()));
    onFilterChange(startOfMonth(new Date()), endOfMonth(new Date()));
  };

  const handleNextMonthClick = () => {
    const nextMonth = addMonths(new Date(), 1);
    const start = startOfMonth(nextMonth);
    const end = endOfMonth(nextMonth);
    setStartDate(start);
    setEndDate(end);
    onFilterChange(start, end);
  };

  const handleThisYearClick = () => {
    const today = new Date();
    setStartDate(startOfYear(today));
    setEndDate(today);
    onFilterChange(startOfYear(today), today);
  };

  const handleApplyClick = () => {
    onFilterChange(startDate, endDate);
    setShowDatePickers(false);
  };

  const getButtonClass = (isActive: boolean) => {
    return `transition-all duration-200 px-4 py-2 rounded-md text-sm font-medium ${isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'bg-background text-foreground border border-border hover:bg-muted'
      }`;
  };

  const isThisWeekActive = !!(currentStartDate && currentEndDate &&
    format(currentStartDate, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { locale: fr }), 'yyyy-MM-dd') &&
    format(currentEndDate, 'yyyy-MM-dd') === format(endOfWeek(new Date(), { locale: fr }), 'yyyy-MM-dd'));

  const isThisMonthActive = !!(currentStartDate && currentEndDate &&
    format(currentStartDate, 'yyyy-MM-dd') === format(startOfMonth(new Date()), 'yyyy-MM-dd') &&
    format(currentEndDate, 'yyyy-MM-dd') === format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const isNextMonthActive = !!(currentStartDate && currentEndDate &&
    format(currentStartDate, 'yyyy-MM-dd') === format(startOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd') &&
    format(currentEndDate, 'yyyy-MM-dd') === format(endOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd'));

  const isThisYearActive = !!(currentStartDate && currentEndDate &&
    format(currentStartDate, 'yyyy-MM-dd') === format(startOfYear(new Date()), 'yyyy-MM-dd') &&
    format(currentEndDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="bg-card rounded-lg shadow-md p-5 mb-6 relative">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 rounded-lg bg-muted/50 p-1">
            <button
              onClick={handleThisWeekClick}
              className={getButtonClass(isThisWeekActive)}
            >
              <div className="flex items-center gap-1.5">
                <Calendar1 className="h-4 w-4" />
                Cette semaine
              </div>
            </button>
            <button
              onClick={handleThisMonthClick}
              className={getButtonClass(isThisMonthActive)}
            >
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Ce Mois
              </div>
            </button>
            <button
              onClick={handleNextMonthClick}
              className={getButtonClass(isNextMonthActive)}
            >
              <div className="flex items-center gap-1.5">
                <CalendarArrowUp className="h-4 w-4" />
                Le Mois Prochain
              </div>
            </button>
            <button
              onClick={handleThisYearClick}
              className={getButtonClass(isThisYearActive)}
            >
              <div className="flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4" />
                Cette année (passé)
              </div>
            </button>
          </div>

          {onExport && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className={`transition-colors duration-200 px-3 py-2 text-sm font-medium bg-card border border-border 
             rounded-md shadow-sm flex items-center gap-2
             ${!isNextMonthActive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted focus:ring-2 focus:ring-primary/30'}`}
                disabled={!isNextMonthActive}
              >
                <ExportIcon className="h-4 w-4" />
                <span>Exporter</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 
                   ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
                  <div className="py-1.5">
                    <button
                      className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
                      onClick={() => { onExport('excel'); setIsExportMenuOpen(false); }}
                    >
                      <span className="w-3 h-3 bg-green-600 rounded-sm mr-3"></span>
                      <span className="font-medium">Format Excel</span>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
                      onClick={() => { onExport('pdf'); setIsExportMenuOpen(false); }}
                    >
                      <span className="w-3 h-3 bg-red-600 rounded-sm mr-3"></span>
                      <span className="font-medium">Format PDF</span>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
                      onClick={() => { onExport('word'); setIsExportMenuOpen(false); }}
                    >
                      <span className="w-3 h-3 bg-blue-600 rounded-sm mr-3"></span>
                      <span className="font-medium">Format Word</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between min-h-[40px]">
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePickers(!showDatePickers)}
              className={`transition-colors duration-200 px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2
                        ${showDatePickers
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground border border-border hover:bg-muted'}`}
            >
              <CalendarSearch className="h-4 w-4" />
              <span>Période personnalisée</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 
                                         ${showDatePickers ? 'rotate-180' : ''}`} />
            </button>

            {showDatePickers && (
              <div className="absolute mt-2 p-4 bg-card border border-border rounded-md shadow-lg z-10 
                animate-in fade-in-50 slide-in-from-top-5 w-[420px]">
                <div className="flex items-end justify-between space-x-4">
                  <div className="flex flex-col space-y-1.5 w-1/2">
                    <label className="text-xs font-medium text-muted-foreground">Date de début</label>
                    <CalendarSelector
                      selectedDate={startDate || undefined}
                      onDateChange={(date: Date | undefined) => setStartDate(date || null)}
                      ignoreAvailability
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5 w-1/2">
                    <label className="text-xs font-medium text-muted-foreground">Date de fin</label>
                    <CalendarSelector
                      selectedDate={endDate || undefined}
                      onDateChange={(date: Date | undefined) => setEndDate(date || null)}
                      ignoreAvailability
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleApplyClick}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md
                 hover:bg-primary/90 transition-colors duration-200 focus:outline-none 
                 focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentStartDate && currentEndDate && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Période actuelle: </span>
              <span>
                {format(currentStartDate, 'dd/MM/yyyy')} - {format(currentEndDate, 'dd/MM/yyyy')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

// Icônes simplifiées pour le design
const ExportIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);