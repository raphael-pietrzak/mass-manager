// EditRowDialog.tsx
import React, { useState, useEffect } from 'react';

interface EditRowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  data: any;
  columns: string[];
  formatters?: Record<string, (value: any) => any>;
}

export const EditRowDialog: React.FC<EditRowDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  data,
  columns,
  formatters = {}
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({...data});
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      ...data,
      ...formData
    };
    onSave(updatedData);
    onClose();
  };

  // Filtrer les colonnes pour exclure l'ID
  const editableColumns = columns.filter(column => column.toLowerCase() !== 'id');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity "></div>
      
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-lg w-full max-w-md p-6 mx-4">
          <h3 className="text-lg font-medium mb-4">Modifier la ligne</h3>
          
          <form onSubmit={handleSubmit}>
            {editableColumns.map(column => (
              <div key={column} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.replace(/_/g, ' ')}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={formData[column] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    [column]: e.target.value
                  })}
                />
              </div>
            ))}
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};