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

  const sanitizedFormatters: Record<string, FormatterConfig> = Object.fromEntries(
    Object.entries(formatters).map(([key, value]) => {
      // Si la valeur est une fonction (FormatterFunction), transforme-la en FormatterConfig
      if (typeof value === 'function') {
        return [key, { type: 'enum', options: [], display: value }];
      }
      return [key, value];
    })
  );

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
      
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* Sélecteur pour le nombre d'éléments par page */}
        <div className="flex justify-between p-4">
          <div>
            <label>Lignes par page :</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="ml-2 p-1 border border-gray-300 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* Contrôles de pagination */}
          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded mx-1"
            >
              &lt;
            </button>
            <span className="mx-1">Page {currentPage} sur {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded mx-1"
            >
              &gt;
            </button>
          </div>
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
