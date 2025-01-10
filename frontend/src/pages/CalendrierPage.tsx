import React, { useState } from 'react';
import { Calendar } from '../components/Calendar';
import { IntentionModal } from '../components/dialogs/IntentionModal';
import { canons, mockIntentions } from '../api/data';
import { MassIntention } from '../api/types';
import { ChevronDown } from 'lucide-react';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCanon, setSelectedCanon] = useState(canons[0].id);
  const [intentions, setIntentions] = useState<MassIntention[]>(mockIntentions);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCanonMenu, setShowCanonMenu] = useState(false);

  const handleIntentionClick = (date: string) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSaveIntention = (data: { intention: string; requestedBy: string }) => {
    const newIntention: MassIntention = {
      id: `${selectedCanon}-${selectedDate}`,
      canonId: selectedCanon,
      date: selectedDate,
      ...data
    };

    setIntentions(prev => {
      const filtered = prev.filter(i => !(i.canonId === selectedCanon && i.date === selectedDate));
      return [...filtered, newIntention];
    });
  };

  const selectedCanonName = canons.find(c => c.id === selectedCanon)?.name;
  const filteredIntentions = intentions.filter(i => i.canonId === selectedCanon);
  const selectedIntention = filteredIntentions.find(i => i.date === selectedDate);

  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowCanonMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Calendrier des Intentions de Messes
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
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