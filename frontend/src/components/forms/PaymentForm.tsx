// frontend/src/components/forms/PaymentForm.tsx
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Utiliser import.meta.env pour Vite
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ amount, onSuccess, onCancel }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    .then(res => res.json())
    .then(data => setClientSecret(data.client_secret));
  }, [amount]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Paiement sécurisé</CardTitle>
      </CardHeader>
      <CardContent>
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <form id="payment-form">
              {/* Éléments Stripe ici */}
              <div className="mb-4">
                <div id="card-element" />
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
                <Button type="submit">
                  Payer {amount}€
                </Button>
              </div>
            </form>
          </Elements>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentForm;