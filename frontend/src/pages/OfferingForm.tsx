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
    // Add your submission logic here
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Informations sur l'offrande</CardTitle>
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
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfferingForm;