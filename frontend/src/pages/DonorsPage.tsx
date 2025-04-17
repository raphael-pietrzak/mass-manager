import { useState, useEffect, useRef } from 'react';
import { DonorList } from '../features/donors/DonorList';
import { exportDonorService } from '../api/exportDonorService';
import { Donor, donorsService } from '../api/donorService';
import DonorModal from '../features/donors/DonorModal';

function DonorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchDonors();
  }, []);

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

  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);

  const paginatedDonors = filteredDonors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset page
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleAddNewDonor = () => {
    setSelectedDonor(null);  // Aucune sélection, c'est une création
    setIsModalOpen(true);   // Ouvre la modal pour ajouter un nouveau donateur
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Barre de recherche avec menu d'exportation intégré */}
        <div className="mt-4 mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center gap-4">
                {/* Barre de recherche */}
                <div className="relative flex-grow">
                    <input
                    type="text"
                    placeholder="Rechercher un donateur..."
                    className="p-2 border border-gray-300 rounded-md w-full pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                    </svg>
                </div>

                {/* Menu d'exportation */}
                <div className="relative" ref={exportMenuRef}>
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
        </div>

        {/* Liste des donateurs filtrés */}
        <div className="mt-6">
          <DonorList
            donors={paginatedDonors}
            onDonorClick={handleDonorClick}
          />
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>

        <DonorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          donor={selectedDonor} // Passer le donateur sélectionné à DonorModal
          mode={selectedDonor ? 'edit' : 'create'}
          onDonorUpdatedOrCreated={fetchDonors}
          onSuccessMessage={setSuccessMessage} // Passer la fonction pour afficher le message de succès
        />
        
        {/* Bouton flottant pour ajouter un donateur */}
        {!isModalOpen && (
          <button
            onClick={() => handleAddNewDonor()}  // Ouvre la modal
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

export default DonorsPage;
