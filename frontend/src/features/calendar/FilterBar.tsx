import React from 'react';
import { List, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  viewMode: 'calendar' | 'list';
  onViewModeChange: (mode: 'calendar' | 'list') => void;
  filters: {
    type: string;
    location: string;
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
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="rounded-lg border-gray-300 text-gray-700 px-3 py-2"
            >
              <option value="all">Tous types</option>
              <option value="basse">Messe basse</option>
              <option value="chantée">Messe chantée</option>
            </select>

            <select
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
              className="rounded-lg border-gray-300 text-gray-700 px-3 py-2"
            >
              <option value="all">Tous lieux</option>
              <option value="Main Chapel">Chapelle principale</option>
              <option value="Side Chapel">Chapelle latérale</option>
              <option value="Cathedral">Cathédrale</option>
            </select>

            <select
              value={filters.celebrant}
              onChange={(e) => onFilterChange('celebrant', e.target.value)}
              className="rounded-lg border-gray-300 text-gray-700 px-3 py-2"
            >
              <option value="all">Tous célébrants</option>
              <option value="Père Jean">Père Jean</option>
              <option value="Père Pierre">Père Pierre</option>
              <option value="Père Marc">Père Marc</option>
              <option value="Père Antoine">Père Antoine</option>
            </select>
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