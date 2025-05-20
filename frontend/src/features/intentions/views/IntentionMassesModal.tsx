import React from 'react';
import { Intention, Masses } from '../../../api/intentionService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Calendar, User, Repeat, Clock } from 'lucide-react';

interface IntentionMassesModalProps {
  intention: Intention;
  masses: Masses[];
  onClose: () => void;
}

export const IntentionMassesModal: React.FC<IntentionMassesModalProps> = ({ intention, masses, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="font-medium text-lg">Détails de l'intention</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="mb-6">
            <h4 className="font-medium text-lg mb-3">Informations de l'intention</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Intention</p>
                <p className="font-medium">{intention.intention_text || "Non spécifiée"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{intention.deceased ? "Défunts" : "Vivants"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Donateur</p>
                <p className="font-medium">{`${intention.donor_firstname || ''} ${intention.donor_lastname || ''}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant</p>
                <p className="font-medium">{intention.amount ? `${intention.amount}€` : "Non spécifié"}</p>
              </div>
              {intention.payment_method && (
                <div>
                  <p className="text-sm text-gray-500">Méthode de paiement</p>
                  <p className="font-medium">
                    {intention.payment_method === 'cash' && 'Espèces'}
                    {intention.payment_method === 'cheque' && 'Chèque'}
                    {intention.payment_method === 'card' && 'Carte bancaire'}
                    {intention.payment_method === 'transfer' && 'Virement'}
                  </p>
                </div>
              )}
              {intention.donor_email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{intention.donor_email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Préférence de date</p>
                <p className="font-medium">
                  {intention.wants_celebration_date ? (
                    intention.date_type === 'indifferent' ? 'Date indifférente' : intention.date_type
                  ) : 'Aucune préférence'}
                </p>
              </div>
              {intention.brother_name && (
                <div>
                  <p className="text-sm text-gray-500">Célébrant souhaité</p>
                  <p className="font-medium">{intention.brother_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Récurrence</p>
                <p className="font-medium">
                  {intention.is_recurrent ? (
                    <span className="flex items-center">
                      <Repeat className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      {intention.recurrence_type}, {intention.occurrences} occurrences
                    </span>
                  ) : "Non récurrente"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Créée le</p>
                <p className="font-medium">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    {intention.created_at ? format(new Date(intention.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr }) : "Non spécifié"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-3">Messes associées</h4>
            {masses.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg text-center text-yellow-700">
                Aucune messe associée à cette intention
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Célébrant
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {masses.map((mass, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                            <span>{mass.date ? format(new Date(mass.date), 'EEE d MMM', { locale: fr }) : "Non définie"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <User className="w-3 h-3 text-gray-400 mr-1.5" />
                            <span>{mass.celebrant_title} {mass.celebrant_name || "Non assigné"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {mass.type === 'defunts' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                              Défunts
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                              Vivants
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {mass.status === 'scheduled' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                              Programmée
                            </span>
                          )}
                          {mass.status === 'cancelled' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                              Annulée
                            </span>
                          )}
                          {mass.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">
                              En attente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
