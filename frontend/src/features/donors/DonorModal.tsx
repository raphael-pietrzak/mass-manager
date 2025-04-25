// DonorModal2.tsx
import React, { useState, useEffect } from 'react';
import { Donor, donorsService } from '../../api/donorService';
import { X } from 'lucide-react';

interface DonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  donor: Donor | null;
  mode: 'create' | 'edit';
  onDonorUpdatedOrCreated: () => void;
  onSuccessMessage: (message: string) => void;
}

type DonorFormData = Omit<Donor, 'id'>;

const DonorModal: React.FC<DonorModalProps> = ({ isOpen, onClose, donor, mode, onDonorUpdatedOrCreated, onSuccessMessage }) => {
  const [formData, setFormData] = useState<DonorFormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip_code: ''
  });

  useEffect(() => {
    if (donor && mode === 'edit') {
      setFormData({
        firstname: donor.firstname || '',
        lastname: donor.lastname || '',
        email: donor.email || '',
        phone: donor.phone || '',
        address: donor.address || '',
        zip_code: donor.zip_code || '',
        city: donor.city || ''
      });
    } else {
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip_code: ''
      });
    }
  }, [donor, mode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'edit' && donor) {
        const response = await donorsService.updateDonor(donor.id, { ...formData, id: donor.id });
        onSuccessMessage(response);
      } else {
        const response = await donorsService.createDonor({ ...formData, id: 0 });  // Assumer que l'API génère l'ID
        onSuccessMessage(response);
      }
      onDonorUpdatedOrCreated(); // Rafraîchir la liste des donateurs après la mise à jour ou la création
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du donateur", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">    
        <div className="p-1 flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {mode === 'edit' ? 'Modifier un Donateur' : 'Ajouter un Donateur'}
          </h2>
          <button
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Prénom<span className="text-red-500"> *</span></span>
              <input
                type="text"
                name="firstname"
                placeholder="Prénom"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nom<span className="text-red-500"> *</span></span>
            <input
              type="text"
              name="lastname"
              placeholder="Nom"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Téléphone</span>
            <input
              type="text"
              name="phone"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Adresse</span>
            <input
              type="text"
              name="address"
              placeholder="Adresse"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <div className="flex gap-4">
            <label className="block w-1/3">
              <span className="text-sm font-medium text-gray-700">Code postal</span>
              <input
                type="number"
                min="1"
                name="zip_code"
                placeholder="11220"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </label>
            <label className="block w-2/3">
              <span className="text-sm font-medium text-gray-700">Ville</span>
              <input
                type="text"
                name="city"
                placeholder="Ville"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </label>
          </div>         
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {mode === 'edit' ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorModal;
