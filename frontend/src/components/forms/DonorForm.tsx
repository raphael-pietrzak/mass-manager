import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';

interface DonorFormData {
  wantsCelebrationDate: boolean;
  email: string;
  phone: string;
  address: string;
}

interface DonorFormProps {
  formData: DonorFormData;
  updateFormData: (data: Partial<DonorFormData>) => void;
  onValidate: () => void;
  prevStep?: () => void;
  handleFinalSubmit?: () => void;
}

const DonorForm: React.FC<DonorFormProps> = ({ 
  formData, 
  updateFormData, 
  onValidate,
  prevStep,
  handleFinalSubmit
}) => {
  const handleValidate = () => {
    if (handleFinalSubmit) handleFinalSubmit();
    onValidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="wantsCelebrationDate"
          checked={formData.wantsCelebrationDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ wantsCelebrationDate: e.target.checked })}
        />
        <Label htmlFor="wantsCelebrationDate">
          Souhaite connaître la date de la célébration
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="exemple@email.com"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="01 23 45 67 89"
          value={formData.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          type="text"
          placeholder="Adresse complète"
          value={formData.address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ address: e.target.value })}
        />
      </div>

      <div className="flex justify-between space-x-4 pt-6">
        {prevStep && (
          <Button type="button" variant="outline" onClick={prevStep}>
            Précédent
          </Button>
        )}
        <Button 
          type="button" 
          onClick={handleValidate}
          className={prevStep ? "" : "w-full"}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

export default DonorForm;