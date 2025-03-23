import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Mass } from './types';
import { fr } from 'date-fns/locale';

interface MassCalendarProps {
  masses: Mass[];
  onMassClick: (mass: Mass) => void;
  onDateClick: (date: string) => void;
}

export const MassCalendar: React.FC<MassCalendarProps> = ({
  masses,
  onMassClick,
  onDateClick,
}) => {
  // Group masses by date
  const massesByDate = masses.reduce((acc, mass) => {
    console.log(mass.date);
    if (!acc[mass.date]) {
      acc[mass.date] = {
        masses: [],
        intentionsCount: 0,
        massCount: 0
      };
    }
    acc[mass.date].masses.push(mass);
    acc[mass.date].massCount++;
    if (mass.intention) {
      acc[mass.date].intentionsCount++;
    }
    return acc;
  }, {} as Record<string, { masses: Mass[], intentionsCount: number, massCount: number }>);

  const events = Object.entries(massesByDate).map(([date, data]) => ({
    start: date,
    allDay: true,
    extendedProps: {
      masses: data.masses,
      intentionsCount: data.intentionsCount,
      massCount: data.massCount
    },
    display: 'background',
    backgroundColor: 'transparent'
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale={fr}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        dateClick={(info) => {
          onDateClick(info.dateStr);
        }}
        eventClick={(info) => {
          onDateClick(info.event.start!.toISOString().split('T')[0]);
        }}
        height="auto"
        dayCellContent={(args) => {
          const date = args.date.toISOString().split('T')[0];
          const dayData = massesByDate[date];
          return (
            <div className="flex flex-col h-full">
              <div className="text-right">{args.dayNumberText}</div>
              {dayData && (
                <div className="flex flex-col gap-1 items-end mt-1">
                  <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded-full">
                    {dayData.massCount} messe{dayData.massCount > 1 ? 's' : ''}
                  </div>
                  {dayData.intentionsCount > 0 && (
                    <div className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded-full">
                      {dayData.intentionsCount} intention{dayData.intentionsCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
        timeZone="UTC"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        dayCellClassNames="hover:bg-gray-50 transition-colors cursor-pointer"
        dayCellDidMount={(info) => {
          info.el.style.transition = 'background-color 0.2s';
        }}
      />
    </div>
  );
};