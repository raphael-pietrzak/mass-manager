import { useState, useEffect } from 'react';
import { MassCalendar } from '../features/calendar/MassCalendar';
import { MassList } from '../features/calendar/MassList';
import { FilterBar } from '../features/calendar/FilterBar';
import { MassModal } from '../features/calendar/MassModal';
import { DaySlider } from '../features/calendar/DaySlider';
import { Mass, ViewMode } from '../features/calendar/types';
import { massService } from '../api/massService';

function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [masses, setMasses] = useState<Mass[]>([]);
  const [selectedMass, setSelectedMass] = useState<Mass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    celebrant: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasses = async () => {
      try {
        const data = await massService.getMasses();
        setMasses(data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des messes');
        setLoading(false);
      }
    };

    fetchMasses();
  }, []);

  const handleMassClick = (mass: Mass) => {
    setSelectedMass(mass);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsSliderOpen(true);
  };

  const handleSaveMass = async (updatedMass: Mass) => {
    try {
      if (updatedMass.id) {
        await massService.updateMass(updatedMass.id, updatedMass);
      } else {
        await massService.createMass(updatedMass);
      }
      const newMasses = await massService.getMasses();
      setMasses(newMasses);
      setIsModalOpen(false);
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la messe');
    }
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

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

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