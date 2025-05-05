import React, { useState } from 'react';
import { EditRowDialog } from '../components/dialogs/EditRowDialog';
import { FormatterConfig } from '../components/dialogs/EditRowDialog';
import { useFetchData } from '../hooks/useFetchData';
import { TabsNavigation } from '../features/database/TabsNavigation';
import { DataTable } from '../features/database/DataTable';
import { tabs } from '../features/database/tabs';
import { useDeleteData } from '../hooks/useDeleteData';
import { useUpdateData } from '../hooks/useUpdateData';
import { DeleteConfirmationDialog } from '../components/dialogs/DeleteConfirmationDialog';
import { Plus } from 'lucide-react';

const DatabaseTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<any>(null);
  const [editColumns, setEditColumns] = useState<Array<{ key: string; label: string }>>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, loading, error, setData } = useFetchData(activeTab);
  const { handleDelete } = useDeleteData(activeTab, setData);
  const { handleUpdate } = useUpdateData(activeTab, setData);

  const selectedTab = tabs.find(tab => tab.key === activeTab);
  const formatters = selectedTab?.formatters || {};

  const sanitizedFormatters = Object.fromEntries(
    Object.entries(formatters).map(([key, value]) => {
      // Si la valeur est une fonction (FormatterFunction), transforme-la en FormatterConfig
      if (typeof value === 'function') {
        return [key, { type: 'enum', options: [], display: value } as FormatterConfig];
      }
      return [key, value as FormatterConfig];
    })
  ) as Record<string, FormatterConfig>;

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await handleDelete(deleteId);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (row: any) => {
    if (!selectedTab) return;

    const columns = selectedTab.columns || Object.keys(row).map(key => ({
      key,
      label: key.replace(/_/g, ' '),
    }));

    setEditRowData(row);
    setEditColumns(columns);
    setIsCreating(false);
    setIsEditDialogOpen(true);
  };

  const handleSave = (updatedData: any) => {
    if (isCreating) {
      // Logique pour créer un nouveau champ
      console.log("Créer un nouveau champ:", updatedData);
      // Vous pourriez implémenter un hook useCreateData similaire à useUpdateData
    } else {
      handleUpdate(updatedData);
    }
  };

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(10);  // Nombre d'éléments par page
  const [currentPage, setCurrentPage] = useState(1);  // Page active

  // Calcul des pages
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Données paginées
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Gérer la sélection du nombre d'éléments par page
  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);  // Réinitialiser la page à 1 lorsqu'on change le nombre d'éléments par page
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-lg p-6">
      
      <div className="flex items-center justify-between mb-4">
        <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <button 
          onClick={() => {
            setEditRowData(null);
            setEditColumns(selectedTab?.columns || []);
            setIsCreating(true);
            setIsEditDialogOpen(true);
          }}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Ajouter une entrée"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            {paginatedData.length > 0 ? (
              <DataTable
                data={paginatedData}
                activeTab={activeTab}
                handleEdit={handleEdit}
                handleDeleteClick={handleDeleteClick}
              />
            ) : (
              <div className="text-center text-gray-500">Pas de données disponibles</div>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> sur <span className="font-medium">{totalItems}</span> entrées
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Lignes par page:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &laquo;
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            
            <span className="px-4 py-1 text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
      
      {selectedTab && (
        <EditRowDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSave}
          data={editRowData}
          columns={editColumns}
          formatters={sanitizedFormatters}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DatabaseTabs;
