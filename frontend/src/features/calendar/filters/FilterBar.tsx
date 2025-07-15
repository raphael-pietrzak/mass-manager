import React, { useState, useEffect } from 'react';
import { List, Calendar as CalendarIcon } from 'lucide-react';
import { celebrantService, Celebrant } from '../../../api/celebrantService';

interface FilterBarProps {
  viewMode: 'calendar' | 'list';
  onViewModeChange: (mode: 'calendar' | 'list') => void;
  filters: {
    celebrant: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onAddSpecialDay: () => void;
  onAddUnavailableDay: () => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  onAddSpecialDay,
  onAddUnavailableDay,
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
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg ${viewMode === 'list'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('calendar')}
              className={`p-2 rounded-lg ${viewMode === 'calendar'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              <CalendarIcon className="w-5 h-5" />
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
                  {celebrant.title} {celebrant.religious_name || `${celebrant.civil_firstname} ${celebrant.civil_lastname}`}
                </option>
              ))}
            </select>
            {loading && <span className="text-gray-500 text-sm">Chargement...</span>}
          </div>
        </div>

        <div className='flex gap-4'>
          {/* Bouton pour les jours particuliers */}
          <div className='flex items-center'>
            <button
              onClick={onAddSpecialDay}
              className="rounded-lg bg-yellow-500 text-white px-3 py-2 hover:bg-yellow-600"
            >
              + Jours Particuliers
            </button>
            <div className="relative">
              <span 
                onClick={(e) => e.stopPropagation()}
                className="ml-1 text-xs bg-yellow-400 hover:bg-yellow-300 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help group"
              >
                ?
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md px-3 py-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-60 whitespace-normal">
                  Ajouter un jour spécial pour empêcher d'affecter une intention ce jour ou augmenter le nombre de messes ce jour (ex: Noël ou Jeudi Saint)
                </div>
              </span>
            </div>
          </div>

          {/* Bouton pour les jours indisponibles */}
          <div className='flex items-center'>
            <button
              onClick={onAddUnavailableDay}
              className="rounded-lg bg-green-500 text-white px-3 py-2 hover:bg-green-600"
            >
              + Jours indisponibles
            </button>
            <div className="relative">
              <span 
                onClick={(e) => e.stopPropagation()}
                className="ml-1 text-xs bg-green-400 hover:bg-green-300 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help group"
              >
                ?
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md px-3 py-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-60 whitespace-normal">
                  Ajouter un ou plusieurs jours indisponible(s) pour un célébrant (jour sans intentions)
                </div>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};