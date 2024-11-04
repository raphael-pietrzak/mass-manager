import React from 'react';
import { Clock, Trash, Edit } from 'lucide-react';
import Button from '@/components/ui/button';

function PendingMasses() {
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PendingMasses;