import React, { useState, useEffect } from 'react';
import CalendarSelector from '../CalendarSelector';
import { X } from 'lucide-react';
import { format } from 'date-fns';

type FormatterOption = {
  label: string;
  value: any;
};

export type FormatterFunction = (value: any, row?: any) => string;

export type FormatterConfig = {
  type: 'enum' | 'boolean' | 'date';
  options?: FormatterOption[];
  display?: FormatterFunction;
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
  }, [data]);

  const getDisplayValue = (key: string, value: any, row: any) => {
    const formatter = formatters[key];
    if (!formatter) return value ?? '';
    if (formatter.display) return formatter.display(value, row);
    if ((formatter.type === 'enum' || formatter.type === 'boolean') && formatter.options) {
      const option = formatter.options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    return value ?? '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const editableColumns = columns.filter(
    (column) => column.label.toLowerCase() !== 'id'
  );

  // Gestion spéciale du champ "celebrant"
  if (editableColumns.find((col) => col.key === 'celebrant_religious_name')) {
    editableColumns.splice(
      editableColumns.findIndex((col) => col.key === 'celebrant'),
      1,
      { key: 'celebrant', label: 'Célébrant' }
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity">
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative bg-white rounded-lg w-full max-w-md p-6 mx-4 max-h-[95vh] overflow-y-auto">
            <div className="p-1 flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Modifier la ligne</h3>
              <button className="p-1 hover:bg-gray-100 rounded-full" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {editableColumns.map((column) => {
                const formatter = formatters[column.key];
                const value = formData[column.key] ?? '';
                if (column.key === 'intention') {
                  return (
                    <div key="intention" className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {column.label.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                        value={formData.intention || ''}
                      />
                    </div>
                  );
                }
                // Champ célébrant (readonly)
                if (column.key === 'celebrant') {
                  return (
                    <div key="celebrant" className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Célébrant
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                        value={`${formData.celebrant_title} ${formData.celebrant_religious_name}` || ''}
                      />
                    </div>
                  );
                }
                // Champ is_recurrent (readonly)
                if (column.key === 'is_recurrent') {
                  return (
                    <div key="is_recurrent" className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Récurrent
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                        value={getDisplayValue(column.key, formData[column.key], formData)}
                      />
                    </div>
                  );
                }
                // Champs intention_type et date_type (readonly)
                if (column.key === 'intention_type' || column.key === 'date_type') {
                  return (
                    <div key={column.key} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {column.label.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                        value={getDisplayValue(column.key, formData[column.key], formData)}
                      />
                    </div>
                  );
                }
                // Champ number_of_masses (readonly)
                if (column.key === 'number_of_masses') {
                  return (
                    <div key="number_of_masses" className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de messes
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                        value={value}
                      />
                    </div>
                  );
                }
                // Champ recurrence_id (readonly)
                if (column.key === 'recurrence_id') {
                  return (
                    <div key="recurrence_id" className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Récurrence
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                        value={value}
                      />
                    </div>
                  );
                }

                // Gestion spéciale du champ "donor"
                if (column.key === 'donor') {
                  const donor = {
                    firstname: formData.donor_firstname || '',
                    lastname: formData.donor_lastname || ''
                  };

                  return (
                    <div key="donor" className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Donateur
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                        value={`${donor.firstname} ${donor.lastname}` || ''}
                      />
                    </div>
                  );
                }

                return (
                  <div key={column.key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.label.replace(/_/g, ' ')}
                    </label>
                    {column.key === 'amount' ? (
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [column.key]: parseFloat(e.target.value),
                          })
                        }
                      />
                    ) : formatter?.type === 'date' ? (
                      <div className="w-full border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed">
                        <CalendarSelector
                          selectedDate={value ? new Date(value) : new Date()}
                          onDateChange={(newDate) => {
                            if (newDate) {
                              setFormData({
                                ...formData,
                                [column.key]: format(newDate, 'yyyy-MM-dd'),
                              });
                            }
                          }}

                          disabled={true}
                        />
                      </div>
                    ) : formatter?.type === 'enum' || formatter?.type === 'boolean' ? (
                      <select
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={String(value)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [column.key]:
                              formatter?.type === 'boolean'
                                ? parseInt(e.target.value)
                                : e.target.value,
                          })
                        }
                      >
                        {formatter.options?.map((opt) => (
                          <option key={opt.value} value={String(opt.value)}>
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
    </div>
  );
};