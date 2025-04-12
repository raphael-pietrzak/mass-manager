import { useState, useEffect } from 'react';
import { MassCalendar } from '../features/calendar/views/MassCalendar';
import { MassList } from '../features/calendar/views/MassList';
import { FilterBar } from '../features/calendar/filters/FilterBar';
import { DateFilterBar } from '../features/calendar/filters/DateFilterBar';
import { MassModal } from '../features/calendar/MassModal';
import { DaySlider } from '../features/calendar/DaySlider';
import { Mass } from '../api/massService';
import { massService } from '../api/massService';
import { exportService } from '../api/exportService';

export type ViewMode = 'calendar' | 'list';


function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [masses, setMasses] = useState<Mass[]>([]);
  const [selectedMass, setSelectedMass] = useState<Mass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [filters, setFilters] = useState({
    celebrant: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null,
    futureOnly: false,
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

  const handleDeleteMass = async (massToDelete: Mass) => {
    try {
      if (massToDelete.id) {
        await massService.deleteMass(massToDelete.id);
        const newMasses = await massService.getMasses();
        setMasses(newMasses);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError('Erreur lors de la suppression de la messe');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateFilterChange = (startDate: Date | null, endDate: Date | null) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleFutureOnlyChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, futureOnly: checked }));
  };

  const handleResetFilters = () => {
    setFilters({
      celebrant: 'all',
      startDate: null,
      endDate: null,
      futureOnly: false,
    });
  };

  const handleAddMass = () => {
    setSelectedMass(null);
    setIsModalOpen(true);
  };

  const handleExport = async (format: 'word' | 'excel' | 'pdf') => {
    try {
      switch (format) {
        case 'word':
          await exportService.exportToWord(filters.startDate, filters.endDate);
          break;
        case 'excel':
          await exportService.exportToExcel(filters.startDate, filters.endDate);
          break;
        case 'pdf':
          await exportService.exportToPdf(filters.startDate, filters.endDate);
          break;
      }
    } catch (err) {
      setError(`Erreur lors de l'exportation au format ${format}`);
    }
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

        {viewMode === 'list' && (
          <DateFilterBar
            onFilterChange={handleDateFilterChange}
            onFutureOnlyChange={handleFutureOnlyChange}
            futureOnly={filters.futureOnly}
            startDate={filters.startDate}
            endDate={filters.endDate}
            onExport={handleExport}
          />
        )}

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
          onDelete={handleDeleteMass}
        />

        <DaySlider
          date={selectedDate}
          masses={masses}
          isOpen={isSliderOpen}
          onClose={() => setIsSliderOpen(false)}
          onMassClick={handleMassClick}
        />

        {!isModalOpen && (
          <button
            onClick={handleAddMass}
            className="fixed bottom-6 right-6 p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
}

export default CalendarPage;