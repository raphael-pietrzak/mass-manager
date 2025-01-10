import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MassIntention } from '../../api/types';

interface IntentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onSave: (intention: { intention: string; requestedBy: string }) => void;
  existingIntention?: MassIntention;
}

export function IntentionModal({ isOpen, onClose, date, onSave, existingIntention }: IntentionModalProps) {
  const [intention, setIntention] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (existingIntention) {
      setIntention(existingIntention.intention);
      setRequestedBy(existingIntention.requestedBy);
      setIsEditing(false);
    } else {
      setIntention('');
      setRequestedBy('');
      setIsEditing(true);
    }
  }, [existingIntention]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ intention, requestedBy });
    setIntention('');
    setRequestedBy('');
    setIsEditing(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={() => onClose()}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            Intention de messe pour le {format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEditing && existingIntention ? (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Intention</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{intention}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Demandée par</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{requestedBy}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label htmlFor="intention" className="block text-sm font-medium text-gray-700 mb-1">
                Intention
              </label>
              <textarea
                id="intention"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="requestedBy" className="block text-sm font-medium text-gray-700 mb-1">
                Demandée par
              </label>
              <input
                type="text"
                id="requestedBy"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (existingIntention) {
                    setIsEditing(false);
                    setIntention(existingIntention.intention);
                    setRequestedBy(existingIntention.requestedBy);
                  } else {
                    onClose();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}