import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface OfferingFormData {
  amount: string;
  paymentMethod: string;
  brotherName: string;
}

interface OfferingFormProps {
  formData: OfferingFormData;
  updateFormData: (data: Partial<OfferingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const OfferingForm: React.FC<OfferingFormProps> = ({ prevStep, nextStep, formData, updateFormData }) => {
  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="amount">Montant versé</Label>
          <Input
            id="amount"
            type="text"
            placeholder="Saisir le montant"
            value={formData.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ amount: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Mode de paiement</Label>
          <Select 
            onValueChange={(value: string) => updateFormData({ paymentMethod: value })}
            value={formData.paymentMethod}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le mode de paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cheque">Chèque</SelectItem>
              <SelectItem value="cash">Liquide</SelectItem>
              <SelectItem value="card">CB</SelectItem>
              <SelectItem value="transfer">Virement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        { (formData.paymentMethod === 'cash' || formData.paymentMethod === 'cheque') && (
          <div className="space-y-2">
            <Label htmlFor="brotherName">Transmise par le frère</Label>
            <Input
              id="brotherName"
              type="text"
              placeholder="Nom du frère"
              value={formData.brotherName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ brotherName: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-between space-x-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Précédent
        </Button>
        <Button type="button" onClick={nextStep}>
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default OfferingForm;