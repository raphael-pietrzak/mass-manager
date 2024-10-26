import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import FormProps from "../interfaces/formProps";



const DonorForm: React.FC<FormProps> = ({ prevStep }) => {

  const [donorData, setDonorData] = React.useState({
    wantsCelebrationDate: false,
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Donor Data:', donorData);
  };

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wantsCelebrationDate"
              checked={donorData.wantsCelebrationDate}
              onCheckedChange={(checked) => 
                setDonorData({ ...donorData, wantsCelebrationDate: checked })
              }
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
              value={donorData.email}
              onChange={(e) => setDonorData({ ...donorData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01 23 45 67 89"
              value={donorData.phone}
              onChange={(e) => setDonorData({ ...donorData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              type="text"
              placeholder="Adresse complète"
              value={donorData.address}
              onChange={(e) => setDonorData({ ...donorData, address: e.target.value })}
            />
          </div>

          <div className="flex space-x-4">
            <Button variant="outline" type="button" className="w-full" onClick={prevStep}>
              Précédent
            </Button>
            <Button type="submit" className="w-full">
              Valider
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DonorForm;