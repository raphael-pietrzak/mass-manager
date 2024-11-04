import { Clock, Trash, Edit } from 'lucide-react';
import { format } from 'path';
import React, { useEffect, useState } from 'react';

interface Intention {
    id: number;
    date_requested: string;
    description: string;
    type: string;
    amount: string;
}

const formatDate = (date: string) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(2);
}


function PendingMasses() {

    const [intentions, setIntentions] = useState<Intention[]>([]);

    const deleteIntention = (id: number) => {
        fetch(`http://localhost:3001/api/data/intentions/${id}`, {
            method: 'DELETE'
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'intention');
            }
            setIntentions((prevIntentions) => prevIntentions.filter((intention) => intention.id !== id));
        })
        .catch((error) => {
            console.error('Erreur:', error);
        });
    }

    useEffect(() => {
        // Récupère les données depuis l'API
        fetch("http://localhost:3001/api/data/intentions")
          .then((response) => {
            console.log(response);
            if (!response.ok) {
              throw new Error("Erreur lors de la récupération des données");
            }
            return response.json();
            }
            )
            .then((data) => {
                setIntentions(data || []);
            }
            )
            .catch((error) => {
                console.error("Erreur:", error);
            });
    });

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex items-center mb-8">
        <Clock className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Pending Mass Intentions</h1>
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-end space-x-4">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Print Intentions
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            Transfer Selected
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intention
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offering
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Example row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-03-15
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">For the souls in purgatory</div>
                  <div className="text-sm text-gray-500">Novena</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $50.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                        <Trash className="h-5 w-5" />
                    </button>
        
                </td>
              </tr>

                {/* Intention rows */}
                {intentions.map((intention) => (
                    <tr key={intention.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(intention.date_requested)}
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{intention.description}</div>
                            <div className="text-sm text-gray-500">{intention.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${formatAmount(intention.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                                <Edit className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => deleteIntention(intention.id)}>
                                <Trash className="h-5 w-5" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PendingMasses;