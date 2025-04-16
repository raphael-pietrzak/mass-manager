import React from 'react';
import { Donor } from '../../api/donorService';
import { Mail, MapPin, Phone, User } from 'lucide-react';

interface DonorListProps {
  donors: Donor[];
  onDonorClick: (donor: Donor) => void;
}

export const DonorList: React.FC<DonorListProps> = ({ donors, onDonorClick }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {donors.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Aucun donateur ne correspond à ces critères
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donors.map(donor => (
              <tr 
                key={donor.id} 
                onClick={() => onDonorClick(donor)} 
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <User className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                    <span>{donor.firstname} {donor.lastname}</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 text-gray-400 mr-1.5" />
                    <span>{donor.email}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 text-gray-400 mr-1.5" />
                    <div>
                      <span>{donor.address}</span>
                      <span className="block text-xs text-gray-500">{donor.zip_code} {donor.city}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 text-gray-400 mr-1.5" />
                    <span>{donor.phone}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};