import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  getDay, 
  setYear, 
  setMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { MassIntention } from '../api/types';

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  intentions: MassIntention[];
  onIntentionClick: (date: string) => void;
}

export function Calendar({ currentDate, onDateChange, intentions, onIntentionClick }: CalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); // End on Sunday
  
  // Generate all dates to display
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const [showMonthPicker, setShowMonthPicker] = React.useState(false);
  const [showYearPicker, setShowYearPicker] = React.useState(false);

  const months = Array.from({ length: 12 }, (_, i) => {
    return format(new Date(2024, i, 1), 'MMMM', { locale: fr });
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    return currentDate.getFullYear() - 5 + i;
  });

  const isWeekend = (date: Date) => {
    const day = getDay(date);
    return day === 6 || day === 0; // 6 = Saturday, 0 = Sunday
  };

  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowMonthPicker(false);
      setShowYearPicker(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <span className="font-semibold">{format(currentDate, 'MMMM', { locale: fr })}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showMonthPicker && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md border p-2 z-10 w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-2 gap-1">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => {
                        onDateChange(setMonth(currentDate, index));
                        setShowMonthPicker(false);
                      }}
                      className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md w-full"
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <span className="font-semibold">{format(currentDate, 'yyyy')}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showYearPicker && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md border p-2 z-10 w-32"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col space-y-1">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        onDateChange(setYear(currentDate, year));
                        setShowYearPicker(false);
                      }}
                      className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md w-full"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const intention = intentions.find(i => i.date === dateStr);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const weekend = isWeekend(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onIntentionClick(dateStr)}
              className={`
                p-2 h-24 border rounded-lg relative
                ${isCurrentMonth ? weekend ? 'bg-gray-50' : 'bg-white' : 'bg-gray-100'}
                ${isToday(day) ? 'border-blue-500' : 'border-gray-200'}
                hover:bg-gray-50 transition-colors
              `}
            >
              <span className={`
                text-sm ${isCurrentMonth ? weekend ? 'text-gray-600' : 'text-gray-900' : 'text-gray-400'}
                ${isToday(day) ? 'font-bold text-blue-500' : ''}
              `}>
                {format(day, 'd')}
              </span>
              {intention && isCurrentMonth && (
                <div className="mt-1 text-xs text-left p-1 bg-blue-50 rounded">
                  <p className="font-medium truncate">{intention.intention}</p>
                  <p className="text-gray-500 truncate">Par: {intention.requestedBy}</p>
                  {intention.mass && (
                    <p className="text-green-600 truncate mt-1">
                      Messe {intention.mass.status === 'scheduled' ? 'prévue' : 
                            intention.mass.status === 'completed' ? 'célébrée' : 'annulée'}
                      {intention.mass.time && ` à ${intention.mass.time}`}
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}