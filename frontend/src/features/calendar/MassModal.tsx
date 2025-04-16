import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Mass, massService, MassPreview } from '../../api/massService';
import { celebrantService, Celebrant } from '../../api/celebrantService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RegularityForm from './forms/RegularityForm';
import DonorForm from './forms/DonorForm';
import OfferingForm from './forms/OfferingForm';
import IntentionForm from './forms/IntentionForm';
import SummaryForm from './forms/SummaryForm';

interface MassModalProps {
  mass: Mass | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: Mass) => void;
}

export const MassModal: React.FC<MassModalProps> = ({
  mass,
  isOpen,
  onClose,
  onSave,
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [selectedCelebrant, setSelectedCelebrant] = useState<string>('');
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [step, setStep] = useState(1); // État pour suivre l'étape actuelle
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<MassPreview | null>(null);

  // Valeur par défaut pour le célébrant non assigné
  const UNASSIGNED_VALUE = "unassigned";

  // Données de formulaire pour la récurrence et le donateur
  const [formData, setFormData] = useState({
    intention: '',
    massCount: 1,
    massType: 'unite',
    dateType: 'indifferente',
    date: undefined as Date | undefined,
    celebrant: '',
    amount: '20',
    paymentMethod: 'card',
    brotherName: '',
    wantsCelebrationDate: false,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    isRecurrent: false,
    startDate: null as Date | null,
    recurrenceType: 'weekly',
    endType: 'occurrences' as 'occurrences' | 'date',
    occurrences: 1,
    endDate: null as Date | null,
    isForDeceased: true, // Par défaut, l'intention est pour un défunt
  });

  // Initialise les données par défaut
  const defaultMass = mass || {
    id: '',
    date: new Date().toISOString().split('T')[0],
    celebrant: UNASSIGNED_VALUE,
    type: 'defunts', // Par défaut défunt
    intention: '',
  };

  // État pour la date sélectionnée
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    mass?.date ? new Date(mass.date) : new Date()
  );

  // Met à jour l'état du célébrant sélectionné quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && mass) {
      setSelectedCelebrant(mass.celebrant || UNASSIGNED_VALUE);
      setFormData(prev => ({
        ...prev,
        intention: mass.intention || '',
        date: mass.date ? new Date(mass.date) : undefined,
        isForDeceased: mass.type === 'defunts',
        // Si ces valeurs existent dans mass, les utiliser, sinon garder les valeurs par défaut
        massCount: mass.massCount || prev.massCount,
        massType: mass.massType || prev.massType,
        dateType: mass.dateType || prev.dateType,
      }));
      setSelectedDate(mass.date ? new Date(mass.date) : new Date());
    } else if (isOpen) {
      setSelectedCelebrant(UNASSIGNED_VALUE);
      setSelectedDate(new Date());
      // Réinitialiser avec les valeurs par défaut
      setFormData(prev => ({
        ...prev,
        intention: '',
        date: undefined,
        isForDeceased: true,
        massCount: 1,
        massType: 'unite',
        dateType: 'indifferente',
      }));
    }
    // Réinitialiser l'état à chaque ouverture
    setShowRecurrenceModal(false);
    setStep(1); // Réinitialiser l'étape à 1 à chaque ouverture
  }, [isOpen, mass]);

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
    { value: UNASSIGNED_VALUE, label: "Aléatoire" },
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

  // Crée l'objet mass à partir des données du formulaire
  const createMassObject = (): Mass => {
    return {
      ...defaultMass,
      date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      celebrant: selectedCelebrant,
      intention: formData.intention,
      type: formData.isForDeceased ? 'defunts' : 'vivants',
      // Informations du donateur
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      postalCode: formData.postalCode,
      city: formData.city,
      wantsCelebrationDate: formData.wantsCelebrationDate,
      // Informations de l'offrande
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      brotherName: formData.brotherName,
      // Informations de la masse
      massCount: formData.massCount,
      massType: formData.massType,
      dateType: formData.dateType,
      // Informations de récurrence
      isRecurrent: formData.startDate !== null,
      recurrenceType: formData.recurrenceType,
      occurrences: formData.occurrences,
      startDate: formData.startDate?.toISOString().split('T')[0],
      endDate: formData.endDate?.toISOString().split('T')[0],
      endType: formData.endType
    };
  };

  // Fonction pour prévisualiser les messes
  const previewMasses = async () => {
    try {
      setIsLoading(true);
      const massObject = createMassObject();
      const preview = await massService.previewMass(massObject);
      setPreviewData(preview);
      setStep(4); // Passer à l'étape de récapitulatif
    } catch (error) {
      console.error("Erreur lors de la prévisualisation des messes:", error);
      // Gestion des erreurs ici
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour confirmer et sauvegarder définitivement
  const confirmAndSave = () => {
    if (!previewData) return;

    const massObject = createMassObject();
    onSave(massObject);
    onClose();
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
              formData={{
                startDate: formData.startDate,
                recurrenceType: formData.recurrenceType,
                endType: formData.endType,
                occurrences: formData.occurrences,
                endDate: formData.endDate
              }}
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
                  intention={formData.intention}
                  selectedDate={selectedDate}
                  selectedCelebrant={selectedCelebrant}
                  celebrantOptions={celebrantOptions}
                  massType={formData.massType}
                  massCount={formData.massCount}
                  dateType={formData.dateType}
                  isForDeceased={formData.isForDeceased}
                  onIntentionChange={(value) => updateFormData({ intention: value })}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    updateFormData({ date });
                  }}
                  onCelebrantChange={(value) => {
                    setSelectedCelebrant(value);
                    updateFormData({ celebrant: value });
                  }}
                  onMassTypeChange={(value) => updateFormData({ massType: value })}
                  onMassCountChange={(value) => updateFormData({ massCount: value })}
                  onDateTypeChange={(value) => updateFormData({ dateType: value })}
                  onIsForDeceasedChange={(value) => updateFormData({ isForDeceased: value })}
                  onRecurrenceClick={handleRecurrenceClick}
                  nextStep={nextStep}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <OfferingForm
                  formData={{
                    amount: formData.amount,
                    paymentMethod: formData.paymentMethod,
                    brotherName: formData.brotherName
                  }}
                  updateFormData={(data) => updateFormData(data)}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <DonorForm
                  formData={{
                    wantsCelebrationDate: formData.wantsCelebrationDate,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    postalCode: formData.postalCode,
                    city: formData.city
                  }}
                  updateFormData={updateFormData}
                  prevStep={prevStep}
                  nextStep={nextStep}
                />
              </div>
            )}

            {step === 4 && (
              <SummaryForm
                previewData={previewData!}
                isLoading={isLoading}
                formData={{
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  postalCode: formData.postalCode,
                  city: formData.city,
                  wantsCelebrationDate: formData.wantsCelebrationDate,
                }}
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