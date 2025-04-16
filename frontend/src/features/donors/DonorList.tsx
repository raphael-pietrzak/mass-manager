import React from 'react';
import { Donor } from '../../api/donorService';
import { Mail, MapPin, Phone, User } from 'lucide-react';

interface DonorListProps {
  donors: Donor[];
  onDonorClick: (donor: Donor) => void;
}

export const DonorList: React.FC<DonorListProps> = ({ donors, onDonorClick }) => {
  return (
    <div className="space-y-4">
      { donors.map((donor) => (
        <div
          key={donor.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onDonorClick(donor)}
        >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-8 h-8 text-gray-500" />
                <span className="font-medium">
                  <span className="text-xl font-medium">{donor.firstname} {donor.lastname}</span>
                </span>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-8 h-8 text-gray-500" />
                <span className="text-lg">{donor.email}</span>
              </div>
              <div className="flex space-x-2">
                <MapPin className="w-8 h-8 text-gray-500" />
                <div className="flex flex-col space-y-1">
                  <span className="text-lg">{donor.address}</span>
                  <span className="text-lg">{donor.zip_code} {donor.city}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-8 h-8 text-gray-500" />
                <span className="text-lg">{donor.phone}</span>
              </div>
            </div>              
          </div>
      ))}
    </div>
  );
};