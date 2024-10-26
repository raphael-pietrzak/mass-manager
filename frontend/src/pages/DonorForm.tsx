import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const OfferingForm = () => {
  const [offeringData, setOfferingData] = React.useState({
    amount: '',
    paymentMethod: '',
    brotherName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Offering Data:', offeringData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Informations sur l'offrande</CardTitle>
          <span className="text-sm text-muted-foreground">
            Étape 1 sur 3
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full mt-4">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: '33.33%' }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant versé</Label>
            <Input
              id="amount"
              type="text"
              placeholder="Saisir le montant"
              value={offeringData.amount}
              onChange={(e) => setOfferingData({ ...offeringData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Mode de paiement</Label>
            <Select 
              onValueChange={(value) => setOfferingData({ ...offeringData, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le mode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="cash">Liquide</SelectItem>
                <SelectItem value="card">CB</SelectItem>
                <SelectItem value="transfer">Virement</SelectItem>
                <SelectItem value="unknown">Inconnu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brotherName">Transmise par le frère</Label>
            <Input
              id="brotherName"
              type="text"
              placeholder="Nom du frère"
              value={offeringData.brotherName}
              onChange={(e) => setOfferingData({ ...offeringData, brotherName: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            Suivant
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfferingForm;