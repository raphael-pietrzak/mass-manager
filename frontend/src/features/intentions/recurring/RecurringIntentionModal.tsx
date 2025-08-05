import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Intention, IntentionSubmission } from '../../../api/intentionService';
import { celebrantService, Celebrant } from '../../../api/celebrantService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseApiDate } from '../../../utils/dateUtils';
import DonorForm from '../forms/DonorForm';
import OfferingForm from '../forms/OfferingForm';
import { Recurrence } from '../../../api/recurrenceService';
import RecurringIntentionForm from './RecurringIntentionForm';
import RecurrenceForm from './RecurrenceForm';
import RecurringIntentionSummury from './RecurringIntentionSmmury';

interface IntentionModalProps {
  intention: IntentionWithRecurrence | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: IntentionSubmission) => void;
}

export type IntentionWithRecurrence = Partial<Intention> & Recurrence

const formDataIntention: IntentionWithRecurrence = {
  intention_text: '',
  deceased: true,
  celebrant_name: '',
  celebrant_id: '',
  amount: '20',
  payment_method: 'card',
  brother_name: '',
  donor_firstname: '',
  donor_lastname: '',
  donor_email: '',
  donor_phone: '',
  donor_address: '',
  donor_postal_code: '',
  donor_city: '',
  type: 'monthly',
  start_date: '',
  end_type: 'occurrences',
  occurrences: 5,
  end_date: '',
  position: 'first',
  weekday: 'monday',
};

export const RecurringIntentionModal: React.FC<IntentionModalProps> = ({
  intention,
  isOpen,
  onClose,
  onSave
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [step, setStep] = useState(1); // État pour suivre l'étape actuelle
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState(formDataIntention);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    intention?.date ? parseApiDate(intention.date) : new Date()
  );

  useEffect(() => {
    const fetchCelebrants = async () => {
      try {
        const data = await celebrantService.getCelebrants();
        setCelebrants(data);
      } catch (error) {
        console.error('Erreur lors du chargement des célébrants:', error);
      }
    };

    if (isOpen) {
      fetchCelebrants();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const defaultForm = intention || formDataIntention;
      // Réinitialiser aux valeurs par défaut ou aux valeurs de l'intention si fournie
      setFormData(defaultForm);
      setSelectedDate(defaultForm?.date ? parseApiDate(defaultForm.date) : new Date());
      setStep(1);
    }
  }, [isOpen, intention]);

  // Fonction mise à jour pour gérer le changement de célébrant
  const handleFormUpdate = (data: Partial<typeof formData>) => {
    setIsError(null);
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const celebrantOptions = [
    { value: '', label: "Aléatoire" },
    ...celebrants.map(c => ({
      value: c.id,
      label: `${c.title} ${c.religious_name}`
    }))
  ];

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Intention de messe";
      case 2: return "Gestion de la récurrence";
      case 3: return "Récapitulatif"
      case 4: return "Don et paiement";
      case 5: return "Informations du donateur";
      default: return "Intention de messe";
    }
  };

  const [isError, setIsError] = useState<string | null>(null);

  const confirmAndSave = async () => {
    try {
      //   setIsLoading(true);
      //   onSave({
      //     donor: {
      //       firstname: formData.donor_firstname || '',
      //       lastname: formData.donor_lastname || '',
      //       email: formData.donor_email || '',
      //       phone: formData.donor_phone,
      //       address: formData.donor_address,
      //       postal_code: formData.donor_postal_code,
      //       city: formData.donor_city,
      //       wants_celebration_date: formData.wants_celebration_date || false,
      //     },
      //     intention_type: formData.intention_type ?? 'unit',
      //     deceased: formData.deceased,
      //     date_type: formData.date_type ?? 'indifferent',
      //     number_of_masses: formData.mass_count ?? 1,
      //     payment: {
      //       amount: formData.amount || '',
      //       payment_method: formData.payment_method as 'cheque' | 'cash' | 'card' | 'transfer',
      //       brother_name: formData.brother_name || undefined,
      //     },
      //     masses: previewData
      //   });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des messes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex w-full items-center justify-center z-50">
      <Card className="max-w-lg w-full mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {getStepTitle()} - {step}/5
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full bg-muted h-2 rounded-full mt-4">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="h-[600px] flex flex-col">
          {step === 1 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <RecurringIntentionForm
                nextStep={nextStep}
                celebrantOptions={celebrantOptions}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <RecurrenceForm
                recurrence={formData}
                updateRecurrence={handleFormUpdate}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <RecurringIntentionSummury
                nextStep={nextStep}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <OfferingForm
                formData={formData}
                updateFormData={handleFormUpdate}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <DonorForm
                formData={formData}
                updateFormData={handleFormUpdate}
                prevStep={prevStep}
                onValidate={confirmAndSave}
              />
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};