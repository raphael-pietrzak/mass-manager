import { useState, useEffect, useRef } from 'react';
import { DonorList } from '../features/donors/DonorList';
import { exportDonorService } from '../api/exportDonorService';
import { Donor, donorsService } from '../api/donorService';
import { DonorModal } from '../features/donors/DonorModal';

function DonorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const data = await donorsService.getDonors();
        setDonors(data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des donateurs');
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const handleDonorClick = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsModalOpen(true);
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      switch (format) {
        case 'excel':
          await exportDonorService.exportToExcel();
          break;
        case 'pdf':
          await exportDonorService.exportToPdf();
          break;
      }
    } catch (err) {
      setError(`Erreur lors de l'exportation au format ${format}`);
    }
  };

  // Filtrage des donateurs en fonction de la recherche
  const filteredDonors = donors.filter(donor => {
    const fullName = `${donor.firstname} ${donor.lastname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Menu d'exportation discret */}
        <div className="mt-4 flex justify-end" ref={exportMenuRef}>
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none flex items-center gap-1"
            >
              <span>Exporter</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <ul className="py-1">
                  <li
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => { handleExport('excel'); setIsExportMenuOpen(false); }}
                  >
                    <span className="w-3 h-3 bg-green-600 rounded-sm mr-2"></span>
                    Format Excel
                  </li>
                  <li
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => { handleExport('pdf'); setIsExportMenuOpen(false); }}
                  >
                    <span className="w-3 h-3 bg-red-600 rounded-sm mr-2"></span>
                    Format PDF
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Barre de recherche dans un conteneur avec style bg-white */}
        <div className="mt-4 mb-6 bg-white rounded-lg shadow p-4">
            <label htmlFor="searchInput" className="block text-xl font-medium text-gray-700 mb-4">
                Rechercher
            </label>
            <div className="relative">
                <input
                type="text"
                placeholder="Rechercher un donateur..."
                className="p-2 border border-gray-300 rounded-md w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Icône de loupe */}
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute top-1/2 right-3 transform -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm7 0l4 4"
                />
                </svg>
            </div>
            </div>

        {/* Liste des donateurs filtrés */}
        <div className="mt-6">
          <DonorList
            donors={filteredDonors}
            onDonorClick={handleDonorClick}
          />
        </div>

        {/* Modal pour afficher les détails du donateur */}
        <DonorModal
          donor={selectedDonor}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
}

export default DonorsPage;
