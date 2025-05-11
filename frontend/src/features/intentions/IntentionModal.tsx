import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Intention, intentionService, IntentionSubmission, Masses } from '../../api/intentionService';
import { celebrantService, Celebrant } from '../../api/celebrantService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateForApi, parseApiDate } from '../../utils/dateUtils';
import RegularityForm from './forms/RegularityForm';
import DonorForm from './forms/DonorForm';
import OfferingForm from './forms/OfferingForm';
import IntentionForm from './forms/IntentionForm';
import SummaryForm from './forms/SummaryForm';

interface IntentionModalProps {
  intention: Intention | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: IntentionSubmission) => void;
}

const testFormData: Partial<Intention> = {
  intention_text: 'Intention test',
  mass_count: 1,
  mass_type: 'unite',
  date_type: 'indifferent',
  date: undefined,
  celebrant_name: '',
  celebrant_id: '',
  amount: '20',
  payment_method: 'card',
  brother_name: '',
  wants_celebration_date: false,
  firstname: 'John',
  lastname: 'Doe',
  email: 'example@email.com',
  phone: '1234567890',
  address: '123 Main St',
  postal_code: '12345',
  city: 'Paris',
  is_recurrent: false,
  start_date: undefined,
  recurrence_type: 'weekly',
  end_type: 'occurrences',
  occurrences: 1,
  end_date: undefined,
  deceased: true,
};

export const IntentionModal: React.FC<IntentionModalProps> = ({
  intention,
  isOpen,
  onClose,
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [step, setStep] = useState(1); // État pour suivre l'étape actuelle
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Masses[]>([]);

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
    }
  }, [isOpen, intention]);

  if (!isOpen) return null;
  

  const handleRecurrenceClick = () => {
    setShowRecurrenceModal(true);
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
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
      case 2: return "Don et paiement";
      case 3: return "Informations du donateur";
      case 4: return "Récapitulatif et confirmation";
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
        mass_type: formData.mass_type,
        date_type: formData.date_type,
        is_recurrent: !!formData.start_date,
        recurrence_type: formData.recurrence_type,
        occurrences: formData.occurrences,
        start_date: formData.start_date,
        end_date: formData.end_date,
        end_type: formData.end_type,
      });
      setPreviewData(preview);
      setStep(4); // Passer à l'étape de récapitulatif
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
      await intentionService.createMass({
        masses: previewData,
        donor: {
          firstname: formData.firstname || '',
          lastname: formData.lastname || '',
          email: formData.email || '',
          phone: formData.phone,
          address: formData.address,
          postal_code: formData.postal_code,
          city: formData.city,
          wants_celebration_date: formData.wants_celebration_date || false,
        },
        payment: {
          amount: formData.amount || '',
          payment_method: formData.payment_method as 'cheque' | 'cash' | 'card' | 'transfer',
          brother_name: formData.brother_name || '',
        },
      });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des messes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showRecurrenceModal ? (
        <div className="bg-white rounded-lg max-w-md w-full mx-4">
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="font-medium">Configuration de la récurrence</h3>
            <button 
              onClick={() => setShowRecurrenceModal(false)} 
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <RegularityForm 
              formData={formData}
              updateFormData={updateFormData}
              onValidate={() => setShowRecurrenceModal(false)}
            />
          </div>
        </div>
      ) : (
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
                <IntentionForm
                  formData={formData}
                  updateFormData={updateFormData}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  celebrantOptions={celebrantOptions}
                  onRecurrenceClick={handleRecurrenceClick}
                  nextStep={nextStep}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <OfferingForm
                  formData={formData}
                  updateFormData={updateFormData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <DonorForm
                  formData={formData}
                  updateFormData={updateFormData}
                  prevStep={prevStep}
                  onValidate={previewMasses}
                />
              </div>
            )}

            {step === 4 && (
              <SummaryForm
                previewData={previewData!}
                isLoading={isLoading}
                formData={formData}
                celebrantOptions={celebrantOptions}
                onValidate={confirmAndSave}
                onEdit={() => setStep(1)}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};