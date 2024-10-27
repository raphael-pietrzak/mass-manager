import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { FormData } from "./formWizard";


interface FormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormProps["formData"]>) => void;
  prevStep: () => void;
  handleFinalSubmit: () => void;
}


const DonorForm: React.FC<FormProps> = ({ prevStep, handleFinalSubmit, formData, updateFormData }) => {


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Informations sur le donateur</CardTitle>
          <span className="text-sm text-muted-foreground">
            Étape 3 sur 3
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full mt-4">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: '100%' }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
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

          <div className="flex space-x-4">
            <Button variant="outline" type="button" className="w-full" onClick={prevStep}>
              Précédent
            </Button>
            <Button type="button" className="w-full" onClick={handleFinalSubmit}>
              Valider
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DonorForm;