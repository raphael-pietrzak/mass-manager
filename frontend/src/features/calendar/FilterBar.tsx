import React, { useState, useEffect } from 'react';
import { List, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { celebrantService, Celebrant } from '../../api/celebrantService';

interface FilterBarProps {
  viewMode: 'calendar' | 'list';
  onViewModeChange: (mode: 'calendar' | 'list') => void;
  filters: {
    celebrant: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCelebrants = async () => {
      setLoading(true);
      try {
        const data = await celebrantService.getCelebrants();
        setCelebrants(data);
      } catch (error) {
        console.error("Erreur lors du chargement des célébrants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCelebrants();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange('calendar')}
              className={`p-2 rounded-lg ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filters.celebrant}
              onChange={(e) => onFilterChange('celebrant', e.target.value)}
              className="rounded-lg border-gray-300 text-gray-700 px-3 py-2"
              disabled={loading}
            >
              <option value="all">Tous célébrants</option>
              {celebrants.map(celebrant => (
                <option key={celebrant.id} value={celebrant.id}>
                  {celebrant.title} {celebrant.religious_name || `${celebrant.civil_first_name} ${celebrant.civil_last_name}`}
                </option>
              ))}
            </select>
            {loading && <span className="text-gray-500 text-sm">Chargement...</span>}
          </div>
        </div>

        <button
          onClick={onResetFilters}
          className="rounded-lg bg-gray-100 text-gray-600 px-3 py-2 flex items-center gap-2 hover:bg-gray-200"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
};