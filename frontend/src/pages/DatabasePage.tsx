import React, { useState } from 'react';
import { EditRowDialog } from '../components/dialogs/EditRowDialog';
import { useFetchData } from '../hooks/useFetchData';
import { TabsNavigation } from '../features/database/TabsNavigation';
import { DataTable } from '../features/database/DataTable';
import { tabs } from '../features/database/tabs';
import { useDeleteData } from '../hooks/useDeleteData';
import { useUpdateData } from '../hooks/useUpdateData';
import { DeleteConfirmationDialog } from '../components/dialogs/DeleteConfirmationDialog';

const DatabaseTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<any>(null);
  const [editColumns, setEditColumns] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Utiliser le hook personnalisé pour gérer les données
  const { data, loading, error, setData } = useFetchData(activeTab);
  const { handleDelete } = useDeleteData(activeTab, setData);
  const { handleUpdate } = useUpdateData(activeTab, setData);

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
    const selectedTab = tabs.find(tab => tab.key === activeTab);
    if (!selectedTab) return;
    
    // Obtenir les colonnes soit depuis la définition du tab, soit depuis les clés de la première ligne
    const columns = selectedTab.columns || Object.keys(row);
    
    setEditRowData(row);
    setEditColumns(columns);
    setIsEditDialogOpen(true);
  };

  const handleSave = (updatedData: any) => {
    handleUpdate(updatedData);
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-lg p-6">
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            {data.length > 0 ? (
              <DataTable
                data={data}
                activeTab={activeTab}
                handleEdit={handleEdit}
                handleDeleteClick={handleDeleteClick}
              />
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </div>
        )}
      </div>

      <EditRowDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSave}
        data={editRowData}
        columns={editColumns} // Colonnes obtenues dynamiquement
        formatters={tabs.find(tab => tab.key === activeTab)?.formatters}
      />

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DatabaseTabs;