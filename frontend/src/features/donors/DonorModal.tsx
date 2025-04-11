import { Donor } from "../../api/donorService";

interface DonorModalProps {
  donor: Donor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DonorModal: React.FC<DonorModalProps> = ({
    donor,
    isOpen,
    onClose,
  }) => {
    if (!isOpen || !donor) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-gray-600 hover:text-black"
          >
            ✖
          </button>
  
          <h2 className="text-xl font-bold mb-4">Détails du donateur</h2>
          
          <div className="space-y-2">
            <div><strong>Prénom :</strong> {donor.firstname}</div>
            <div><strong>Nom :</strong> {donor.lastname}</div>
            {donor.email && <div><strong>Email :</strong> <a href={`mailto:${donor.email}`}>{donor.email}</a></div>}
            {donor.phone && <div><strong>Téléphone :</strong> {donor.phone}</div>}
            {donor.address && <div><strong>Adresse :</strong> {donor.address} {donor.zip_code} {donor.city}</div>}
          </div>
        </div>
      </div>
    );
  };
  