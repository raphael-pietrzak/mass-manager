import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { tabs } from './tabs';

interface DataTableProps {
  data: any[];
  activeTab: string;
  handleEdit: (row: any) => void;
  handleDeleteClick: (id: number) => void;
}

const formatValue = (value: any, columnKey: string, formatters: Record<string, any>, row: any) => {
  const formatter = formatters[columnKey];

  if (!formatter) return value; // Si pas de formatteur, retourner la valeur brute

  // Gestion des formatters de type 'boolean' ou 'enum'
 if (formatter.type === 'boolean') {
  const boolValue = value === true || value === 1 || value === '1';
  return boolValue ? 'Oui' : 'Non';
}

  if (formatter.type === 'enum' && formatter.options) {
    const option = formatter.options.find((opt: { value: any }) => opt.value === value);
    return option ? option.label : value;
  }

  // Gestion du type 'date' pour formater une chaîne de date
  if (formatter.type === 'date') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
  }

  if (columnKey === "celebrant") {
    return `${row.celebrant_title} ${row.celebrant_religious_name}`;
  }

  if (columnKey === "donor") {
    return `${row.donor_firstname} ${row.donor_lastname}`;
  }

  return value; // Retourner la valeur brute pour les autres cas
};

export const DataTable: React.FC<DataTableProps> = ({ data, activeTab, handleEdit, handleDeleteClick }) => {
  const selectedTab = tabs.find(tab => tab.key === activeTab);
  if (!selectedTab || data.length === 0) return null;

  // Colonnes du tab sélectionné (ou toutes les clés si aucune colonne n'est définie)
  const columns = selectedTab.columns || Object.keys(data[0]);
  const formatters = selectedTab.formatters || {};

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => {
            // Récupérer le label pour chaque colonne, sinon afficher la clé
            const columnLabel = typeof column === 'string' ? column.replace(/_/g, ' ') : column.label;
            return (
              <th
                key={typeof column === 'string' ? column : column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {columnLabel}
              </th>
            );
          })}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((column: string | { key: string; label: string }) => {
              const columnKey = typeof column === 'string' ? column : column.key;
              const cellValue = formatValue(row[columnKey], columnKey, formatters, row);

              return (
                <td key={typeof column === 'string' ? column : column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cellValue}
                </td>
              );
            })}
            {/* Colonne des actions */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors" onClick={() => handleEdit(row)}>
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors" onClick={() => handleDeleteClick(row.id)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
