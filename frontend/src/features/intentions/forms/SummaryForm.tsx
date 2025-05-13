import React from 'react';
import { Button } from '@/components/ui/button';
import { Intention, Masses } from '../../../api/intentionService';

interface SummaryFormProps {
  previewData: Masses[];
  isLoading: boolean;
  formData: Partial<Intention>;
  celebrantOptions: { value: string; label: string }[];
  onValidate: () => void;
  onEdit: () => void;
}

const SummaryForm: React.FC<SummaryFormProps> = ({
  previewData,
  isLoading,
  formData,
  celebrantOptions,
  onValidate,
  onEdit,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Une erreur s'est produite lors du chargement du récapitulatif.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-auto h-full">
      <div>
        <h3 className="font-semibold text-lg mb-2">Récapitulatif</h3>
        <div className="bg-muted p-3 rounded-md">
          <p><span className="font-medium">Nombre de messes:</span> {previewData.length}</p>
          <p><span className="font-medium">Don total:</span> {formData.amount} €</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">Messes planifiées</h3>
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {previewData.map((mass, index) => (
            <div key={index} className="border p-3 rounded-md">
              <p><span className="font-medium">Date:</span> {mass.date || "Date à déterminer"}</p>
              <p><span className="font-medium">Intention:</span> {mass.intention}</p>
              <p><span className="font-medium">Type:</span> {mass.type === 'defunts' ? 'Défunts' : 'Vivants'}</p>
              <p><span className="font-medium">Célébrant:</span> {mass.celebrant_name || (celebrantOptions.find(c => c.value === mass.celebrant_id)?.label || 'Non assigné')}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">Détails du donateur</h3>
        <div className="bg-muted p-3 rounded-md">
          <p><span className="font-medium">Nom:</span> {formData.firstname} {formData.lastname}</p>
          <p><span className="font-medium">Email:</span> {formData.email}</p>
          {formData.phone && <p><span className="font-medium">Téléphone:</span> {formData.phone}</p>}
          {formData.address && 
            <p><span className="font-medium">Adresse:</span> {formData.address}, {formData.postal_code} {formData.city}</p>
          }
          <p>
            <span className="font-medium">Souhaite date de célébration:</span> {formData.wants_celebration_date ? 'Oui' : 'Non'}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onEdit}>
          Modifier
        </Button>
        <Button onClick={onValidate}>
          Confirmer
        </Button>
      </div>
    </div>
  );
};

export default SummaryForm;
