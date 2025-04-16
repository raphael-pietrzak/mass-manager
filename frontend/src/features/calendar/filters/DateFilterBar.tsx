import React, { useState, useRef, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';

interface DateFilterBarProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
  onFutureOnlyChange: (checked: boolean) => void;
  futureOnly: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onExport?: (format: 'excel' | 'pdf') => Promise<void>;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  onFilterChange,
  onFutureOnlyChange,
  futureOnly,
  startDate: currentStartDate,
  endDate: currentEndDate,
  onExport
}) => {
  const [showDatePickers, setShowDatePickers] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(currentStartDate);
  const [endDate, setEndDate] = useState<Date | null>(currentEndDate);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target as Node)) {
        setShowStartCalendar(false);
      }
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target as Node)) {
        setShowEndCalendar(false);
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

  const handleTodayClick = () => {
    const today = new Date();
    setStartDate(startOfDay(today));
    setEndDate(endOfDay(today));
    onFilterChange(startOfDay(today), endOfDay(today));
  };

  const handleThisWeekClick = () => {
    const today = new Date();
    setStartDate(startOfWeek(today, { locale: fr }));
    setEndDate(endOfWeek(today, { locale: fr }));
    onFilterChange(startOfWeek(today, { locale: fr }), endOfWeek(today, { locale: fr }));
  };

  const handleThisMonthClick = () => {
    const today = new Date();
    setStartDate(startOfMonth(today));
    setEndDate(endOfMonth(today));
    onFilterChange(startOfMonth(today), endOfMonth(today));
  };

  const handleAllClick = () => {
    setStartDate(null);
    setEndDate(null);
    onFilterChange(null, null);
  };

  const handleApplyClick = () => {
    onFilterChange(startDate, endDate);
    setShowDatePickers(false);
  };

  const getButtonClass = (isActive: boolean) => {
    return `transition-all duration-200 px-4 py-2 rounded-md text-sm font-medium ${
      isActive 
        ? 'bg-primary text-primary-foreground shadow-sm' 
        : 'bg-background text-foreground border border-border hover:bg-muted'
    }`;
  };

  const isTodayActive = !!(currentStartDate && currentEndDate && 
    format(currentStartDate, 'yyyy-MM-dd') === format(startOfDay(new Date()), 'yyyy-MM-dd') &&
    format(currentEndDate, 'yyyy-MM-dd') === format(endOfDay(new Date()), 'yyyy-MM-dd'));

  const isThisWeekActive = !!(currentStartDate && currentEndDate && 
    format(currentStartDate, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { locale: fr }), 'yyyy-MM-dd') &&
    format(currentEndDate, 'yyyy-MM-dd') === format(endOfWeek(new Date(), { locale: fr }), 'yyyy-MM-dd'));

  const isThisMonthActive = !!(currentStartDate && currentEndDate && 
    format(currentStartDate, 'yyyy-MM-dd') === format(startOfMonth(new Date()), 'yyyy-MM-dd') &&
    format(currentEndDate, 'yyyy-MM-dd') === format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const isAllActive = !currentStartDate && !currentEndDate;

  return (
    <div className="bg-card rounded-lg shadow-md p-5 mb-6 relative">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex space-x-1 rounded-lg bg-muted/50 p-1">
            <button 
              onClick={handleTodayClick}
              className={getButtonClass(isTodayActive)}
            >
              <div className="flex items-center gap-1.5">
                <CalendarDayIcon className="h-4 w-4" />
                Aujourd'hui
              </div>
            </button>
            <button 
              onClick={handleThisWeekClick}
              className={getButtonClass(isThisWeekActive)}
            >
              <div className="flex items-center gap-1.5">
                <CalendarWeekIcon className="h-4 w-4" />
                Cette semaine
              </div>
            </button>
            <button 
              onClick={handleThisMonthClick}
              className={getButtonClass(isThisMonthActive)}
            >
              <div className="flex items-center gap-1.5">
                <CalendarMonthIcon className="h-4 w-4" />
                Ce mois
              </div>
            </button>
            <button 
              onClick={handleAllClick}
              className={getButtonClass(isAllActive)}
            >
              <div className="flex items-center gap-1.5">
                <CalendarAllIcon className="h-4 w-4" />
                Tous
              </div>
            </button>
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="future-only"
                checked={futureOnly}
                onChange={(e) => onFutureOnlyChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
              />
              <label htmlFor="future-only" className="ml-2 text-sm font-medium text-muted-foreground cursor-pointer">
                Événements à venir uniquement
              </label>
            </div>
          </div>
          
          {onExport && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="transition-colors duration-200 px-3 py-2 text-sm font-medium bg-card border border-border 
                           rounded-md shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30 
                           flex items-center gap-2"
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
              <CalendarRangeIcon className="h-4 w-4" />
              <span>Période personnalisée</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 
                                         ${showDatePickers ? 'rotate-180' : ''}`} />
            </button>
            
            {showDatePickers && (
              <div className="absolute mt-2 p-4 bg-card border border-border rounded-md shadow-lg z-10 
                             animate-in fade-in-50 slide-in-from-top-5 w-[420px]">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Date de début</label>
                      <div className="relative" ref={startCalendarRef}>
                        <button
                          className="w-full min-w-[180px] px-3 py-1.5 bg-background border border-input rounded-md text-sm text-left font-normal
                                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStartCalendar(!showStartCalendar);
                            setShowEndCalendar(false);
                          }}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, 'P', { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </button>
                        {showStartCalendar && (
                          <div className="absolute left-0 mt-1 p-2 bg-white border rounded-md shadow-lg z-20">
                            <Calendar
                              mode="single"
                              selected={startDate || undefined}
                              onSelect={(date: Date | undefined) => {
                                setStartDate(date || null);
                                setShowStartCalendar(false);
                              }}
                              locale={fr}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Date de fin</label>
                      <div className="relative" ref={endCalendarRef}>
                        <button
                          className="w-full min-w-[180px] px-3 py-1.5 bg-background border border-input rounded-md text-sm text-left font-normal
                                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEndCalendar(!showEndCalendar);
                            setShowStartCalendar(false);
                          }}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, 'P', { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </button>
                        {showEndCalendar && (
                          <div className="absolute left-0 mt-1 p-2 bg-white border rounded-md shadow-lg z-20">
                            <Calendar
                              mode="single"
                              selected={endDate || undefined}
                              onSelect={(date: Date | undefined) => {
                                setEndDate(date || null);
                                setShowEndCalendar(false);
                              }}
                              locale={fr}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
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
    </div>
  );
};

// Icônes simplifiées pour le design
const CalendarDayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <rect x="8" y="14" width="2" height="2"></rect>
  </svg>
);

const CalendarWeekIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const CalendarMonthIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <line x1="8" y1="14" x2="8" y2="18"></line>
    <line x1="12" y1="14" x2="12" y2="18"></line>
    <line x1="16" y1="14" x2="16" y2="18"></line>
  </svg>
);

const CalendarAllIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <circle cx="12" cy="16" r="2"></circle>
  </svg>
);

const CalendarRangeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <path d="M8 14h.01"></path>
    <path d="M16 18h.01"></path>
    <path d="M12 16h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 18h.01"></path>
  </svg>
);

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

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
