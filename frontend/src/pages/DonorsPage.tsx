import { useState, useEffect, useRef } from 'react';
import { MassList } from '../features/calendar/DonorList';
import { DateFilterBar } from '../features/calendar/DateFilterBar';
import { MassModal } from '../features/calendar/MassModal';
import { Mass } from '../features/calendar/types';
import { massService } from '../api/massService';
import { exportService } from '../api/exportService';

function DonorsPage() {
    const [masses, setMasses] = useState<Mass[]>([]);
    const [selectedMass, setSelectedMass] = useState<Mass | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
    celebrant: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null,
    futureOnly: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

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

    const handleDateFilterChange = (startDate: Date | null, endDate: Date | null) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
    };

    const handleFutureOnlyChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, futureOnly: checked }));
    };

    const handleExport = async (format: 'word' | 'excel' | 'pdf') => {
    try {
        switch (format) {
        case 'word':
            await exportService.exportToWord();
            break;
        case 'excel':
            await exportService.exportToExcel();
            break;
        case 'pdf':
            await exportService.exportToPdf();
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
                    onClick={() => { handleExport('word'); setIsExportMenuOpen(false); }}
                    >
                    <span className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></span>
                    Format Word
                    </li>
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

        
        <DateFilterBar
        onFilterChange={handleDateFilterChange}
        onFutureOnlyChange={handleFutureOnlyChange}
        futureOnly={filters.futureOnly}
        startDate={filters.startDate}
        endDate={filters.endDate}
        />
        

        <div className="mt-6">
            <MassList
                masses={masses}
                onMassClick={handleMassClick}
                filters={filters}
            />
        </div>

        <MassModal
            mass={selectedMass}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={() => {}}
            onDelete={() => {}}
        />
    </main>
</div>
);
}

export default DonorsPage;