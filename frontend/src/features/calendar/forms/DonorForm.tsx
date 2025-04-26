import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Intention } from '../../../api/intentionService';

interface DonorFormProps {
  formData: Partial<Intention>;
  updateFormData: (data: Partial<Intention>) => void;
  prevStep: () => void;
  onValidate: () => void;
}

const DonorForm: React.FC<DonorFormProps> = ({ 
  formData, 
  updateFormData, 
  prevStep, 
  onValidate 
}) => {
  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Prénom</Label>
            <Input
              id="first_name"
              placeholder="Prénom"
              value={formData.first_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ first_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Nom</Label>
            <Input
              id="last_name"
              placeholder="Nom"
              value={formData.last_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ last_name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemple.com"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Numéro de téléphone"
            value={formData.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            placeholder="Adresse"
            value={formData.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postal_code">Code postal</Label>
            <Input
              id="postal_code"
              placeholder="Code postal"
              value={formData.postal_code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ postal_code: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              placeholder="Ville"
              value={formData.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ city: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="wants_celebration_date" 
            checked={formData.wants_celebration_date} 
            onCheckedChange={(checked: boolean | "indeterminate") => 
              updateFormData({ wants_celebration_date: checked as boolean })
            }
          />
          <Label htmlFor="wants_celebration_date">
            Souhaite recevoir la date de célébration
          </Label>
        </div>
      </div>

      <div className="pt-6 flex justify-between space-x-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Précédent
        </Button>
        <Button type="button" onClick={onValidate}>
          Prévisualiser
        </Button>
      </div>
    </div>
  );
};

export default DonorForm;