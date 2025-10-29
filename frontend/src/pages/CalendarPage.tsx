import { useState, useEffect } from 'react';
import { MassCalendar } from '../features/calendar/views/MassCalendar';
import { MassList } from '../features/calendar/views/MassList';
import { FilterBar } from '../features/calendar/filters/FilterBar';
import { DateFilterBar } from '../features/calendar/filters/DateFilterBar';
import { DaySlider } from '../features/calendar/DaySlider';
import { Mass } from '../api/massService';
import { massService } from '../api/massService';
import { exportService } from '../api/exportService';
import { SpecialDaysModal } from '../features/special_days/SpecialDaysModal';
import { UnavailableDayModal } from '../features/unavailableDays/UnavailableDayModal';

export type ViewMode = 'calendar' | 'list';

function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [masses, setMasses] = useState<Mass[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const [filters, setFilters] = useState({
    celebrant: 'all',
    startDate: nextMonth as Date | null,
    endDate: endOfNextMonth as Date | null,
    futureOnly: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpecialDayModalOpen, setIsSpecialDayModalOpen] = useState(false);
  const [isUnavailableDayModalOpen, setIsUnavailableDayModalOpen] = useState(false)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMasses = async () => {
    setLoading(true);
    try {
      const response = await massService.getMassesByDateRange(filters.startDate, filters.endDate, page, filters.celebrant === "all" ? null : filters.celebrant);
      setMasses(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError('Erreur lors du chargement des messes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasses();
  }, [filters.startDate, filters.endDate, filters.celebrant, page]);

  const handleMassClick = (mass: Mass) => {
    console.log('Messe cliquée dans le slider du calendrier', mass);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsSliderOpen(true);
  };

  const handleUpdateMass = async (mass: Partial<Mass>) => {
    //setSelectedMass(mass);
    await massService.updateMass(mass);
    //setIsMassModalOpen(true);
    fetchMasses();
  };

  const handleDeleteMass = async (massToDelete: Mass) => {
    try {
      if (massToDelete.id) {
        await massService.deleteMass(massToDelete.id);
        fetchMasses()
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la messe');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'celebrant') setPage(1);
  };

  const handleDateFilterChange = (startDate: Date | null, endDate: Date | null) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
    setPage(1);
  };


  const handleAddSpecialDay = () => {
    setIsSpecialDayModalOpen(true);
  };

  const handleAddUnavailableDay = () => {
    setIsUnavailableDayModalOpen(true)
  }

  const handleExport = async (format: 'excel' | 'pdf' | 'word') => {
    try {
      switch (format) {
        case 'excel':
          await exportService.exportToExcel(filters.startDate, filters.endDate);
          break;
        case 'pdf':
          await exportService.exportToPdf(filters.startDate, filters.endDate);
          break;
        case 'word':
          await exportService.exportToWord(filters.startDate, filters.endDate);
          break;
      }
    } catch (err) {
      setError(`Erreur lors de l'exportation au format ${format}`);
    }
  };

  if (error) return <div className="text-center py-10">Erreur: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Calendrier des Messes</h1>
        <FilterBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddSpecialDay={handleAddSpecialDay}
          onAddUnavailableDay={handleAddUnavailableDay}
        />

        {viewMode === 'list' && (
          <DateFilterBar
            onFilterChange={handleDateFilterChange}
            startDate={filters.startDate}
            endDate={filters.endDate}
            onExport={handleExport}
          />
        )}

        <div className="mt-6">
          {viewMode === 'calendar' ? (
            <MassCalendar
              masses={masses}
              onDateClick={handleDateClick}
            />
          ) : (
            <MassList
              masses={masses}
              filters={filters}
              onDeleteMass={handleDeleteMass}
              onUpdateMass={handleUpdateMass}
              loading={loading}
            />
          )}
        </div>

        {!loading && totalPages > 0 && masses.length > 0 && (
          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              ← Précédent
            </button>

            <span className="text-sm text-gray-600">
              Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              Suivant →
            </button>
          </div>
        )}

        <DaySlider
          date={selectedDate}
          masses={masses}
          isOpen={isSliderOpen}
          onClose={() => setIsSliderOpen(false)}
          onMassClick={handleMassClick}
        />

        <SpecialDaysModal
          isOpen={isSpecialDayModalOpen}
          onClose={() => setIsSpecialDayModalOpen(false)}
        />

        <UnavailableDayModal
          isOpen={isUnavailableDayModalOpen}
          onClose={() => setIsUnavailableDayModalOpen(false)}
        />
      </main>
    </div>
  );
}

export default CalendarPage;