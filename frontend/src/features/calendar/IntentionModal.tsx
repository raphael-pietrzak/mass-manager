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
  intention: 'Intention test',
  massCount: 1,
  massType: 'unite',
  dateType: 'indifferente',
  date: undefined,
  celebrant_name: '',
  celebrant_id: '',
  amount: '20',
  paymentMethod: 'card',
  brotherName: '',
  wantsCelebrationDate: false,
  firstName: 'John',
  lastName: 'Doe',
  email: 'example@email.com',
  phone: '1234567890',
  address: '123 Main St',
  postalCode: '12345',
  city: 'Paris',
  isRecurrent: false,
  startDate: undefined,
  recurrenceType: 'weekly',
  endType: 'occurrences',
  occurrences: 1,
  endDate: undefined,
  isForDeceased: true,
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
      label: c.religious_name || `${c.civil_first_name} ${c.civil_last_name}`
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
        intention: formData.intention,
        date: formData.date || formatDateForApi(selectedDate),
        isForDeceased: formData.isForDeceased,
        massCount: formData.massCount,
        massType: formData.massType,
        dateType: formData.dateType,
        isRecurrent: !!formData.startDate,
        recurrenceType: formData.recurrenceType,
        occurrences: formData.occurrences,
        startDate: formData.startDate,
        endDate: formData.endDate,
        endType: formData.endType,
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
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          email: formData.email || '',
          phone: formData.phone,
          address: formData.address,
          postalCode: formData.postalCode,
          city: formData.city,
          wantsCelebrationDate: formData.wantsCelebrationDate || false,
        },
        payment: {
          amount: formData.amount || '',
          paymentMethod: formData.paymentMethod as 'cheque' | 'cash' | 'card' | 'transfer',
          brotherName: formData.brotherName,
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