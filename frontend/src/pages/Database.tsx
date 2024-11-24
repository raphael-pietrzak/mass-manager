import React, { useState } from 'react';
import axios from 'axios';
import { Edit, Trash } from 'lucide-react';
import { tabs } from '../api/tabs';
import { EditRowDialog } from '../components/EditRowDialog';

const DatabaseTabs: React.FC = () => {

  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<any>(null);
  const [editColumns, setEditColumns] = useState<string[]>([]);

  const fetchData = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(endpoint);
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const selectedTab = tabs.find(tab => tab.key === activeTab);
    if (selectedTab) {
      fetchData(selectedTab.endpoint);
    }
  }, [activeTab]);

  const handleDelete = async (id: number) => {
    const selectedTab = tabs.find(tab => tab.key === activeTab);
    if (!selectedTab) return;

    try {
      await axios.delete(`${selectedTab.endpoint}/${id}`);
      setData(prevData => prevData.filter((item: any) => item.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
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
    const selectedTab = tabs.find(tab => tab.key === activeTab);
    if (!selectedTab) return;

    setData(prevData => prevData.map((item: any) => item.id === updatedData.id ? updatedData : item));
  };

  const renderTable = () => {
    const selectedTab = tabs.find(tab => tab.key === activeTab);
    if (!selectedTab || data.length === 0) return null;

    const columns = selectedTab.columns || Object.keys(data[0]);
    const formatters = selectedTab.formatters || {};

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th 
                key={column} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.replace(/_/g, ' ')}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row: any) => (
            <tr key={row.id}>
              {columns.map(column => (
                <td 
                  key={column} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {formatters[column] 
                    ? formatters[column](row[column]) 
                    : String(row[column])}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  onClick={() => handleEdit(row)}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-lg p-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Data Display */}
      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            {data.length > 0 ? renderTable() : (
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
    </div>
  );
};

export default DatabaseTabs;