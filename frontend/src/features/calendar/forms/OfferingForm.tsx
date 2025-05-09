import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Intention } from '../../../api/intentionService';

interface OfferingFormProps {
  formData: Partial<Intention>;
  updateFormData: (data: Partial<Intention>) => void;
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
          <Label htmlFor="payment_method">Mode de paiement</Label>
            <Select 
            onValueChange={(value: 'cheque' | 'cash' | 'card' | 'transfer') => updateFormData({ payment_method: value })}
            value={formData.payment_method as 'cheque' | 'cash' | 'card' | 'transfer'}
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
        
        { (formData.payment_method === 'cash' || formData.payment_method === 'cheque') && (
          <div className="space-y-2">
            <Label htmlFor="brother_name">Transmise par le frère</Label>
            <Input
              id="brother_name"
              type="text"
              placeholder="Nom du frère"
              value={formData.brother_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ brother_name: e.target.value })}
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