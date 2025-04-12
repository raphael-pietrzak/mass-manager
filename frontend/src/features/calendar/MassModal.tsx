import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, RotateCw, User, CalendarIcon } from 'lucide-react';
import { Mass } from '../../api/massService';
import { DropdownSearch } from '../../components/DropdownSearch';
import { celebrantService, Celebrant } from '../../api/celebrantService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RegularityForm from '../../components/forms/RegularityForm';
import DonorForm from '../../components/forms/DonorForm';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import OfferingForm from '../../components/forms/OfferingForm';

interface MassModalProps {
  mass: Mass | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mass: Mass) => void;
  onDelete?: (mass: Mass) => void;
}

export const MassModal: React.FC<MassModalProps> = ({
  mass,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [selectedCelebrant, setSelectedCelebrant] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [step, setStep] = useState(1); // État pour suivre l'étape actuelle
  
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
    email: '',
    phone: '',
    address: '',
    isRecurrent: false,
    startDate: null as Date | null,
    recurrenceType: 'weekly',
    endType: 'occurrences' as 'occurrences' | 'date',
    occurrences: 1,
    endDate: null as Date | null
  });
  
  // Initialise les données par défaut
  const defaultMass = mass || {
    id: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00', // Conservé dans les données mais plus édité via l'interface
    celebrant: UNASSIGNED_VALUE,
    location: 'Main Chapel',
    type: 'basse',
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
      }));
      setSelectedDate(mass.date ? new Date(mass.date) : new Date());
    } else if (isOpen) {
      setSelectedCelebrant(UNASSIGNED_VALUE);
      setSelectedDate(new Date());
    }
    // Réinitialiser l'état de confirmation à chaque ouverture
    setShowDeleteConfirm(false);
    setShowRecurrenceModal(false);
    setShowDonorModal(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    const formData = new FormData(formEl);
    const updatedMass: Mass = {
      ...defaultMass,
      date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      time: defaultMass.time,
      celebrant: selectedCelebrant,
      location: formData.get('location') as string || defaultMass.location,
      type: formData.get('type') as 'defunts' | 'vivants' || defaultMass.type,
      intention: formData.get('intention') as string,
    };
    onSave(updatedMass);
  };

  const handleDelete = () => {
    if (mass && onDelete) {
      onDelete(mass);
    }
  };

  const handleRecurrenceClick = () => {
    setShowRecurrenceModal(true);
  };

  const handleDonorClick = () => {
    setShowDonorModal(true);
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const celebrantOptions = [
    { value: UNASSIGNED_VALUE, label: "Aléatoire" },
    ...celebrants.map(c => ({
      value: c.id,
      label: c.religious_name || `${c.civil_first_name} ${c.civil_last_name}`
    }))
  ];

  // Formulaire de l'étape 1: Intention
  const IntentionForm = () => (
    <>
      {/* Intention */}
      <div className="space-y-2">
        <Label htmlFor="intention">
          Intention <span className="text-red-500">*</span>
        </Label>
        <Input
          id="intention"
          name="intention"
          value={formData.intention}
          onChange={(e) => updateFormData({ intention: e.target.value })}
          required
          placeholder="Votre intention..."
        />
      </div>

      {/* Date avec Popover/Calendar et icônes */}
      <div className="flex items-end gap-2">
        <div className="flex-grow space-y-2">
          <Label htmlFor="date">
            Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal"
                id="date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, 'P', { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => {
                  setSelectedDate(date);
                  updateFormData({ date: date });
                }}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRecurrenceClick}
          title="Programmer une récurrence"
        >
          <RotateCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Célébrant */}
      <div className="space-y-2">
        <Label>Célébrant</Label>
        <DropdownSearch
          options={celebrantOptions}
          value={selectedCelebrant}
          onChange={(value) => {
            setSelectedCelebrant(value);
            updateFormData({ celebrant: value });
          }}
          placeholder="Sélectionner un célébrant"
          defaultValue={UNASSIGNED_VALUE}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          type="button"
          onClick={nextStep}
        >
          Suivant
        </Button>
      </div>
    </>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Intention de messe";
      case 2: return "Don et paiement";
      case 3: return "Informations du donateur";
      default: return "Intention de messe";
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
      ) : showDonorModal ? (
        <div className="bg-white rounded-lg max-w-md w-full mx-4">
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="font-medium">Informations du donateur</h3>
            <button 
              onClick={() => setShowDonorModal(false)} 
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <DonorForm 
              formData={formData}
              updateFormData={updateFormData}
              onValidate={() => setShowDonorModal(false)}
            />
          </div>
        </div>
      ) : (
        <Card className="max-w-lg w-full mx-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {getStepTitle()} - {step}/3
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
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Boîte de dialogue de confirmation de suppression */}
            {showDeleteConfirm && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">Confirmer la suppression</p>
                </div>
                <p className="text-sm text-red-600 mb-3">
                  Êtes-vous sûr de vouloir supprimer cette messe ? Cette action est irréversible.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    size="sm"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    size="sm"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="space-y-4"
                >
                  <IntentionForm />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="space-y-4"
                >
                  <OfferingForm
                    formData={formData}
                    updateFormData={updateFormData}
                    nextStep={nextStep}
                    prevStep={prevStep}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-6">
                    <DonorForm
                      formData={formData}
                      updateFormData={updateFormData}
                      onValidate={() => {
                        const updatedMass: Mass = {
                          ...defaultMass,
                          date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                          time: defaultMass.time,
                          celebrant: selectedCelebrant,
                          intention: formData.intention,
                        };
                        onSave(updatedMass);
                        onClose();
                      }}
                    />

                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        Précédent
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Bouton de suppression en bas si masse existante */}
            {mass && mass.id && onDelete && step === 1 && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  Supprimer cette messe
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};