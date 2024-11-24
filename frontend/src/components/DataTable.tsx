
import React from 'react';
import { Edit, Trash } from 'lucide-react';
import { tabs } from '../api/tabs';

interface DataTableProps {
  data: any[];
  activeTab: string;
  handleEdit: (row: any) => void;
  handleDeleteClick: (id: number) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, activeTab, handleEdit, handleDeleteClick }) => {
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
              <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatters[column] ? formatters[column](row[column]) : String(row[column])}
              </td>
            ))}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button className="text-indigo-600 hover:text-indigo-900 mr-4" onClick={() => handleEdit(row)}>
                <Edit className="h-5 w-5" />
              </button>
              <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(row.id)}>
                <Trash className="h-5 w-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;