// FormWizard.tsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MassRequestForm from './MassForm';
import OfferingForm from './OfferingForm';
import DonorForm from './DonorForm';
import RegularityForm from './RegularityForm';

export interface FormData {
  intention: string;
  massCount: number;
  massType: string;
  dateType: string;
  date: Date | undefined;
  celebrant: string;
  amount: string;
  paymentMethod: string;
  brotherName: string;
  wantsCelebrationDate: boolean;
  email: string;
  phone: string;
  address: string;
  isRecurrent: boolean;
  startDate: Date | null;
  recurrenceType: string;
  endType: 'occurrences' | 'date';
  occurrences: number;
  endDate: Date | null;
}

const FormWizard = () => {
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [formData, setFormData] = useState<FormData>({
    intention: '',
    massCount: 1,
    date: undefined,
    massType: 'unite',
    dateType: 'indifferente',
    celebrant: '',
    amount: '20',
    paymentMethod: 'card',
    brotherName: '',
    wantsCelebrationDate: false,
    email: '',
    phone: '',
    address: '',
    isRecurrent: false,
    startDate: null,
    recurrenceType: '',
    endType: 'occurrences',
    occurrences: 1,
    endDate: null
  });

  // Fonction de transition vers l'étape suivante
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4)); // Augmenter le max à 4
  
  // Fonction de transition vers l'étape précédente
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));


  const updateFormData = (data: Partial<typeof formData>) => {
    console.log("Updating form data:", data);
    setFormData((prevData) => ({ ...prevData, ...data }));
  };

  const submitForm = async () => {
    console.log("Final form data:", formData);
    try {
      const response = await fetch("http://localhost:3001/api/data/intentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Error submitting form");
      setNotification({ type: 'success', message: 'Intention de messe bien enregistrée!' });
      console.log("Form successfully submitted:", formData);
    } catch (error) {
      console.error("Submission error:", error);
      setNotification({ type: 'error', message: 'Erreur lors de l\'enregistrement de l\'intention' });
    }
  };

  const handleFinalSubmit = async () => {
    submitForm();
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {notification && (
        <div className={`mb-4 p-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}
      <AnimatePresence>
        {step === 1 && (
          <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          >
            <MassRequestForm 
            nextStep={nextStep} 
            formData={formData}
            updateFormData={updateFormData}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          >
            <OfferingForm 
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep} prevStep={prevStep} />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
          >
            <RegularityForm 
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep} 
              prevStep={prevStep}
            />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          >
            <DonorForm 
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
            handleFinalSubmit={handleFinalSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// export wizard and interface

export default FormWizard;