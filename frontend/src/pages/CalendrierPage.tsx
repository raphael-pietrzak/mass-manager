import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { IntentionModal } from '../components/dialogs/IntentionModal';
import { canons } from '../api/data';
import { MassIntention } from '../api/types';
import { ChevronDown } from 'lucide-react';
import { IntentionsService, MassesService } from '../api/services';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCanon, setSelectedCanon] = useState(canons[0].id);
  const [intentions, setIntentions] = useState<MassIntention[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCanonMenu, setShowCanonMenu] = useState(false);
  const [showAllCanons, setShowAllCanons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [intentionsData, massesData] = await Promise.all([
          IntentionsService.getAll(),
          MassesService.getAll()
        ]);
        
        // Combine intentions with masses data
        const combinedData = intentionsData.map(intention => {
          const mass = massesData.find(m => m.intention_id === intention.id);
          return {
            ...intention,
            mass: mass ? {
              celebrantId: mass.celebrant_id,
              status: mass.status,
              time: mass.time
            } : undefined
          };
        });

        setIntentions(combinedData);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIntentionClick = (date: string) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSaveIntention = async (data: { intention: string; requestedBy: string }) => {
    try {
      const newIntention = await IntentionsService.create({
        canonId: selectedCanon,
        date: selectedDate,
        ...data
      });

      setIntentions(prev => [...prev, newIntention]);
      setModalOpen(false);
    } catch (err) {
      setError("Erreur lors de l'enregistrement de l'intention");
      console.error(err);
    }
  };

  const selectedCanonName = canons.find(c => c.id === selectedCanon)?.name;
  const filteredIntentions = intentions.filter(i => 
    showAllCanons ? true : i.canonId === selectedCanon
  );
  const selectedIntention = filteredIntentions.find(i => i.date === selectedDate);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowCanonMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Calendrier des Intentions de Messes
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCanonMenu(!showCanonMenu);
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-left bg-white border rounded-lg hover:bg-gray-50"
              >
                <span className="font-medium">{selectedCanonName}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
              
              {showCanonMenu && (
                <div 
                  className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canons.map((canon) => (
                    <button
                      key={canon.id}
                      onClick={() => {
                        setSelectedCanon(canon.id);
                        setShowCanonMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                        selectedCanon === canon.id ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      {canon.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showAllCanons}
                  onChange={(e) => setShowAllCanons(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Voir toutes les messes</span>
              </label>
            </div>
          </div>
        </div>

        <Calendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          intentions={filteredIntentions}
          onIntentionClick={handleIntentionClick}
        />

        <IntentionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          date={selectedDate}
          onSave={handleSaveIntention}
          existingIntention={selectedIntention}
        />
      </div>
    </div>
  );
}

export default App;