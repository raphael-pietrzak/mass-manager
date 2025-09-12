import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Intention, Masses } from '../../../api/intentionService';
import { celebrantService, Celebrant } from '../../../api/celebrantService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DonorForm from '../forms/DonorForm';
import OfferingForm from '../forms/OfferingForm';
import { Recurrence, recurrenceService, RecurringIntentionSubmission } from '../../../api/recurrenceService';
import RecurringIntentionForm from './RecurringIntentionForm';
import RecurrenceForm from './RecurrenceForm';
import RecurringIntentionSummury from './RecurringIntentionSmmury';
import { Alert, AlertDescription } from '../../../components/ui/alert';

interface IntentionModalProps {
  intention: IntentionWithRecurrence | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (intention: RecurringIntentionSubmission) => void;
}

export type IntentionWithRecurrence = Partial<Intention> & Recurrence

const formDataIntention: IntentionWithRecurrence = {
  id: '',
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
  wants_celebration_date: false,
  type: 'monthly',
  start_date: '',
  end_type: 'occurrences',
  occurrences: 5,
  end_date: '',
  position: undefined,
  weekday: undefined,
  random_celebrant: true
};

export const RecurringIntentionModal: React.FC<IntentionModalProps> = ({
  intention,
  isOpen,
  onClose,
  onSave
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [step, setStep] = useState(1); // État pour suivre l'étape actuelle
  const [previewData, setPreviewData] = useState<Masses[]>([]);
  const [formData, setFormData] = useState(formDataIntention);
  const [isLoading, setIsLoading] = useState(false);

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
      defaultForm.random_celebrant = !defaultForm.celebrant_id;
      setFormData(prev => ({ ...prev, ...defaultForm }));
      setStep(1);
      setPreviewData([]);
    }
  }, [isOpen, intention]);

  // Fonction mise à jour pour gérer le changement de célébrant
  const handleFormUpdate = (data: Partial<typeof formData>) => {
    setIsError(null);
    // mettre à jour random_celebrant selon ce que l’utilisateur fait
    if (data.celebrant_id !== undefined) {
      data.random_celebrant = data.celebrant_id === '' || data.celebrant_id === null;
    }
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

  const previewMasses = async (data: Partial<IntentionWithRecurrence>) => {
    try {
      setIsLoading(true);
      // Met à jour tout de suite le formData du parent avec les dernières valeurs
      setFormData(prev => ({ ...prev, ...data }));
      const preview = await recurrenceService.previewMasses(data);
      setPreviewData(preview);
      setStep(3); // Passer à l'étape de récapitulatif
    } catch (error: any) {
      console.error("Erreur lors de la prévisualisation des messes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAndSave = async () => {
    if (!previewData) return;
    try {
      setIsLoading(true);
      // Injecter random_celebrant dans chaque masse
      const massesWithRandomFlag = previewData.map(m => ({
        ...m,
        random_celebrant: formData.random_celebrant ? 1 : 0
      }));
      console.log('masses envoyées au back:', massesWithRandomFlag);
      onSave({ ...formData, masses: massesWithRandomFlag });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'intention:", error);
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
                formData={formData}
                updateFormData={handleFormUpdate}
                nextStep={nextStep}
                celebrantOptions={celebrantOptions}
              />
              {isError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>{isError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <RecurrenceForm
                recurrence={formData}
                updateRecurrence={handleFormUpdate}
                nextStep={previewMasses}
                prevStep={prevStep}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <RecurringIntentionSummury
                nextStep={nextStep}
                prevStep={prevStep}
                data={formData}
                previewData={previewData}
                isLoading={isLoading}
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