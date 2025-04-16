import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';

interface DonorFormData {
  wantsCelebrationDate: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
}

interface DonorFormProps {
  formData: DonorFormData;
  updateFormData: (data: Partial<DonorFormData>) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const DonorForm: React.FC<DonorFormProps> = ({ 
  formData, 
  updateFormData, 
  prevStep,
  nextStep
}) => {
  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-6 overflow-y-auto">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="wantsCelebrationDate"
            checked={formData.wantsCelebrationDate}
            onCheckedChange={(checked: boolean | 'indeterminate') => updateFormData({ wantsCelebrationDate: checked as boolean })}
          />
          <Label htmlFor="wantsCelebrationDate">
            Souhaite connaître la date de la célébration
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Nom"
              value={formData.lastName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ lastName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Prénom"
              value={formData.firstName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ firstName: e.target.value })}
            />
          </div>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              type="text"
              placeholder="Code postal"
              value={formData.postalCode || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ postalCode: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              type="text"
              placeholder="Ville"
              value={formData.city || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ city: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between space-x-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Précédent
        </Button>
        <Button type="button" onClick={nextStep}>
          Prévisualiser
        </Button>
      </div>
    </div>
  );
};

export default DonorForm;