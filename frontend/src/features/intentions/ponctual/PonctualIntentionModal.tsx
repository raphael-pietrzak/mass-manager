import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Intention, intentionService, IntentionSubmission, Masses } from '../../../api/intentionService';
import { celebrantService, Celebrant } from '../../../api/celebrantService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateForApi, parseApiDate } from '../../../utils/dateUtils';
import DonorForm from '../forms/DonorForm';
import OfferingForm from '../forms/OfferingForm';
import PonctualIntentionForm from './forms/PonctualIntentionForm';
import SummaryForm from '../forms/SummaryForm';

interface IntentionModalProps {
  intention: Intention | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: IntentionSubmission) => void;
}

const testFormData: Partial<Intention> = {
  intention_text: '',
  mass_count: 1,
  deceased: true,
  intention_type: 'unit',
  date_type: 'indifferent',
  date: undefined,
  celebrant_name: '',
  celebrant_id: '',
  amount: '20',
  payment_method: 'card',
  brother_name: '',
  wants_celebration_date: false,
  donor_firstname: '',
  donor_lastname: '',
  donor_email: '',
  donor_phone: '',
  donor_address: '',
  donor_postal_code: '',
  donor_city: '',
};

export const PonctualIntentionModal: React.FC<IntentionModalProps> = ({
  intention,
  isOpen,
  onClose,
  onSave
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [step, setStep] = useState(1); // État pour suivre l'étape actuelle
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Masses[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]); // Nouvel état pour les dates indisponibles

  const [formData, setFormData] = useState(testFormData);

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
      // Réinitialiser aux valeurs par défaut ou aux valeurs de l'intention si fournie
      setFormData(intention || testFormData);
      setSelectedDate(intention?.date ? parseApiDate(intention.date) : new Date());
      setStep(1);
      setPreviewData([]);
      setUnavailableDates([]); // Réinitialiser les dates indisponibles
    }
  }, [isOpen, intention]);

  // Nouvelle fonction pour récupérer les dates indisponibles d'un célébrant
  const fetchUnavailableDates = async (celebrantId: string) => {
    if (!celebrantId) {
      setUnavailableDates([]);
      return;
    }

    try {
      const dates = await celebrantService.getUnavailableDates(celebrantId);
      setUnavailableDates(dates);
    } catch (error) {
      console.error('Erreur lors de la récupération des dates indisponibles:', error);
      setUnavailableDates([]);
    }
  };

  // Fonction mise à jour pour gérer le changement de célébrant
  const handleFormUpdate = (data: Partial<typeof formData>) => {
    // Si l'ID du célébrant a changé, récupérer ses dates indisponibles
    if (data.celebrant_id !== undefined && data.celebrant_id !== formData.celebrant_id) {
      fetchUnavailableDates(data.celebrant_id);
    }

    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
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
      case 2: return "Récapitulatif de l'intention";
      case 3: return "Don et paiement";
      case 4: return "Informations du donateur";
      default: return "Intention de messe";
    }
  };

  const previewMasses = async () => {
    try {
      setIsLoading(true);
      const preview = await intentionService.previewMasses({
        celebrant_id: formData.celebrant_id,
        intention_text: formData.intention_text,
        date: formData.date || formatDateForApi(selectedDate),
        deceased: formData.deceased,
        mass_count: formData.mass_count,
        intention_type: formData.intention_type,
        date_type: formData.date_type,
      });
      setPreviewData(preview);
      setStep(2); // Passer à l'étape de récapitulatif
    } catch (error) {
      console.error("Erreur lors de la prévisualisation des messes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAndSave = async () => {
    if (!previewData) return;

    try {
      setIsLoading(true);
      onSave({
        donor: {
          firstname: formData.donor_firstname || '',
          lastname: formData.donor_lastname || '',
          email: formData.donor_email || '',
          phone: formData.donor_phone,
          address: formData.donor_address,
          postal_code: formData.donor_postal_code,
          city: formData.donor_city,
          wants_celebration_date: formData.wants_celebration_date || false,
        },
        intention_type: formData.intention_type ?? 'unit',
        deceased: formData.deceased || true,
        date_type: formData.date_type || '',
        number_of_masses: formData.mass_count ?? 1,
        payment: {
          amount: formData.amount || '',
          payment_method: formData.payment_method as 'cheque' | 'cash' | 'card' | 'transfer',
          brother_name: formData.brother_name || undefined,
        },
        masses: previewData
      });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des messes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-lg w-full mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {getStepTitle()} - {step}/4
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
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="h-[600px] flex flex-col">
          {step === 1 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <PonctualIntentionForm
                formData={formData}
                updateFormData={handleFormUpdate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                celebrantOptions={celebrantOptions}
                nextStep={previewMasses}
                unavailableDates={unavailableDates}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <SummaryForm
                previewData={previewData}
                isLoading={isLoading}
                formData={formData}
                celebrantOptions={celebrantOptions}
                onValidate={confirmAndSave}
                onEdit={() => setStep(1)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <OfferingForm
                formData={formData}
                updateFormData={handleFormUpdate}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}

          {step === 4 && (
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