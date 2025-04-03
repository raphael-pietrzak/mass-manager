import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';

interface FormData {
  wantsCelebrationDate: boolean;
  email: string;
  phone: string;
  address: string;
}

interface DonorFormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onValidate: () => void;
}

const DonorForm: React.FC<DonorFormProps> = ({ formData, updateFormData, onValidate }) => {
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

      <div className="pt-4">
        <Button type="button" className="w-full" onClick={onValidate}>
          Valider
        </Button>
      </div>
    </div>
  );
};

export default DonorForm;