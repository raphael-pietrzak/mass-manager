import React, { useState, useRef, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateFilterBarProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
  onFutureOnlyChange: (checked: boolean) => void;
  futureOnly: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onExport?: (format: 'word' | 'excel' | 'pdf') => Promise<void>;
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
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef]);

  const handleTodayClick = () => {
    const today = new Date();
    onFilterChange(startOfDay(today), endOfDay(today));
  };

  const handleThisWeekClick = () => {
    const today = new Date();
    onFilterChange(startOfWeek(today, { locale: fr }), endOfWeek(today, { locale: fr }));
  };

  const handleThisMonthClick = () => {
    const today = new Date();
    onFilterChange(startOfMonth(today), endOfMonth(today));
  };

  const handleAllClick = () => {
    onFilterChange(null, null);
  };

  const handleApplyClick = () => {
    onFilterChange(startDate, endDate);
  };

  const getButtonClass = (isActive: boolean) => {
    return `px-4 py-2 rounded-md ${
      isActive 
        ? 'bg-blue-600 text-white' 
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleTodayClick}
            className={getButtonClass(isTodayActive)}
          >
            Aujourd'hui
          </button>
          <button 
            onClick={handleThisWeekClick}
            className={getButtonClass(isThisWeekActive)}
          >
            Cette semaine
          </button>
          <button 
            onClick={handleThisMonthClick}
            className={getButtonClass(isThisMonthActive)}
          >
            Ce mois
          </button>
          <button 
            onClick={handleAllClick}
            className={getButtonClass(isAllActive)}
          >
            Tous
          </button>
          
          {onExport && (
            <div className="relative ml-auto" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none flex items-center gap-1"
              >
                <span>Exporter</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <ul className="py-1">
                    <li 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => { onExport('word'); setIsExportMenuOpen(false); }}
                    >
                      <span className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></span>
                      Format Word
                    </li>
                    <li 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => { onExport('excel'); setIsExportMenuOpen(false); }}
                    >
                      <span className="w-3 h-3 bg-green-600 rounded-sm mr-2"></span>
                      Format Excel
                    </li>
                    <li 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => { onExport('pdf'); setIsExportMenuOpen(false); }}
                    >
                      <span className="w-3 h-3 bg-red-600 rounded-sm mr-2"></span>
                      Format PDF
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button 
            onClick={() => setShowDatePickers(!showDatePickers)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {showDatePickers ? 'Masquer' : 'Période personnalisée'}
          </button>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="future-only"
              checked={futureOnly}
              onChange={(e) => onFutureOnlyChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="future-only" className="ml-2 text-sm text-gray-700">
              Événements à venir uniquement
            </label>
          </div>
        </div>
        
        {showDatePickers && (
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <label className="text-sm text-gray-600 mr-2">Du:</label>
              <input
                type="date"
                className="px-2 py-1 border rounded"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mr-2">Au:</label>
              <input
                type="date"
                className="px-2 py-1 border rounded"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <button 
              onClick={handleApplyClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Appliquer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
