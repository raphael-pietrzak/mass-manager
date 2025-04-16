import React, { useState, useEffect } from 'react';

type FormatterOption = {
  label: string;
  value: any;
};

export type FormatterConfig = {
  type: 'enum' | 'boolean' | 'date';
  options?: FormatterOption[];
  display?: (value: any) => string;
};


interface EditRowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  data: any;
  columns: Array<{ key: string; label: string }>;
  formatters?: Record<string, FormatterConfig>;
}

export const EditRowDialog: React.FC<EditRowDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  data,
  columns,
  formatters = {},
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
    //console.log('Data updated:', data);
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const editableColumns = columns.filter(
    (column) => column.label.toLowerCase() !== 'id'
  );

  const formatDateForInput = (value: any): string => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-lg w-full max-w-md p-6 mx-4">
          <h3 className="text-lg font-medium mb-4">Modifier la ligne</h3>

          <form onSubmit={handleSubmit}>
            {editableColumns.map((column) => {
              const formatter = formatters[column.key];
              const value = formData[column.key] ?? '';

              return (
                <div key={column.key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.label.replace(/_/g, ' ')}
                  </label>

                  {formatter?.type === 'date' || column.key.toLowerCase().includes('date') ? (
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={formatDateForInput(value)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [column.key]: e.target.value,
                        })
                      }
                    />
                  ) : formatter?.type === 'enum' || formatter?.type === 'boolean' ? (
                    <select
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [column.key]: formatter?.type === 'boolean' ? parseInt(e.target.value) : e.target.value,
                        })
                      }
                    >
                      
                      {formatter.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [column.key]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              );
            })}

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
