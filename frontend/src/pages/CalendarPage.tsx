import { useState } from 'react';
import { MassCalendar } from '../features/calendar/MassCalendar';
import { MassList } from '../features/calendar/MassList';
import { FilterBar } from '../features/calendar/FilterBar';
import { MassModal } from '../features/calendar/MassModal';
import { DaySlider } from '../features/calendar/DaySlider';
import { Mass, ViewMode } from '../features/calendar/types';

// Sample data - replace with actual data from your backend
const sampleMasses: Mass[] = [
  {
    id: '1',
    date: '2025-03-20',
    time: '08:00',
    type: 'basse',
    celebrant: 'Père Jean',
    location: 'Main Chapel',
  },
  {
    id: '2',
    date: '2025-03-20',
    time: '18:30',
    type: 'chantée',
    intention: 'Pour les malades',
    celebrant: 'Père Pierre',
    location: 'Cathedral',
  },
  {
    id: '3',
    date: '2025-03-21',
    time: '10:00',
    type: 'basse',
    celebrant: 'Père Marc',
    location: 'Side Chapel',
  },
  {
    id: '4',
    date: '2025-03-22',
    time: '19:00',
    type: 'chantée',
    intention: 'Action de grâce',
    celebrant: 'Père Antoine',
    location: 'Cathedral',
  },
];

function CalendarPage() {
const [viewMode, setViewMode] = useState<ViewMode>('calendar');
const [masses, setMasses] = useState<Mass[]>(sampleMasses);
const [selectedMass, setSelectedMass] = useState<Mass | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [isSliderOpen, setIsSliderOpen] = useState(false);
const [filters, setFilters] = useState({
  type: 'all',
  location: 'all',
  celebrant: 'all',
});

const handleMassClick = (mass: Mass) => {
  setSelectedMass(mass);
  setIsModalOpen(true);
};

const handleDateClick = (date: string) => {
  setSelectedDate(date);
  setIsSliderOpen(true);
};

const handleSaveMass = (updatedMass: Mass) => {
  setMasses(prevMasses =>
    prevMasses.map(mass =>
      mass.id === updatedMass.id ? updatedMass : mass
    )
  );
  setIsModalOpen(false);
};

const handleFilterChange = (key: string, value: string) => {
  setFilters(prev => ({ ...prev, [key]: value }));
};

const handleResetFilters = () => {
  setFilters({
    type: 'all',
    location: 'all',
    celebrant: 'all',
  });
};

return (
  <div className="min-h-screen bg-gray-100">
    

    <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <FilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <div className="mt-6">
        {viewMode === 'calendar' ? (
          <MassCalendar
            masses={masses}
            onMassClick={handleMassClick}
            onDateClick={handleDateClick}
          />
        ) : (
          <MassList
            masses={masses}
            onMassClick={handleMassClick}
            filters={filters}
          />
        )}
      </div>

      <MassModal
        mass={selectedMass}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMass}
      />

      <DaySlider
        date={selectedDate}
        masses={masses}
        isOpen={isSliderOpen}
        onClose={() => setIsSliderOpen(false)}
        onMassClick={handleMassClick}
      />
    </main>
  </div>
);
}

export default CalendarPage;