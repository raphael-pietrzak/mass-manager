import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormData } from "./formWizard";


interface FormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormProps["formData"]>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const OfferingForm: React.FC<FormProps> = ({ prevStep, nextStep, formData, updateFormData }) => {


  return (
    <Card className="w-full max-w-md mx-auto min-h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Don</CardTitle>
          <span className="text-sm text-muted-foreground">
            Étape 2 sur 4
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full mt-4">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: '50%' }}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-6">
          <form className="h-full flex flex-col space-y-6">
            <div className="flex-1 space-y-6">
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
          </form>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex space-x-4">
            <Button variant="outline" type="button" className="w-full" onClick={prevStep}>
              Précédent
            </Button>
            <Button type="button" className="w-full" onClick={nextStep}>
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferingForm;