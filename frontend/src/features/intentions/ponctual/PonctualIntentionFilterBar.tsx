import { CalendarCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DateFilterBarProps {
  onExport?: (format: 'excel' | 'pdf' | 'word') => Promise<void>;
  selectedCount: number;
}

const PonctualIntentionFilterBar: React.FC<DateFilterBarProps> = ({ onExport, selectedCount }) => {
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef]);

  const isDisabled = selectedCount === 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200
                ${isDisabled 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
                }`}
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Répartir les intentions ({selectedCount})</span>
            </button>
          </div>
          <div className='flex gap-4'>
            {onExport && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => !isDisabled && setIsExportMenuOpen(!isExportMenuOpen)}
                  disabled={isDisabled}
                  className={`transition-colors duration-200 px-3 py-2 text-sm font-medium rounded-md shadow-sm
                    flex items-center gap-2 ${
                      isDisabled
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-card border border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30'
                    }`}
                >
                  <ExportIcon className="h-4 w-4" />
                  <span>Exporter & Supprimer ({selectedCount})</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 
                    ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
                    <div className="py-1.5">
                      <button
                        className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
                        onClick={() => { onExport('excel'); setIsExportMenuOpen(false); }}
                      >
                        <span className="w-3 h-3 bg-green-600 rounded-sm mr-3"></span>
                        <span className="font-medium">Format Excel</span>
                      </button>
                      <button
                        className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
                        onClick={() => { onExport('pdf'); setIsExportMenuOpen(false); }}
                      >
                        <span className="w-3 h-3 bg-red-600 rounded-sm mr-3"></span>
                        <span className="font-medium">Format PDF</span>
                      </button>
                      <button
                        className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
                        onClick={() => { onExport('word'); setIsExportMenuOpen(false); }}
                      >
                        <span className="w-3 h-3 bg-blue-600 rounded-sm mr-3"></span>
                        <span className="font-medium">Format Word</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
      </div>
    </div>
  )
}

const ExportIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default PonctualIntentionFilterBar;