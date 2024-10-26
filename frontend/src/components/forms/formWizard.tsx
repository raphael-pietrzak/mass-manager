// FormWizard.tsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MassRequestForm from './MassForm';
import OfferingForm from './OfferingForm';
import DonorForm from './DonorForm';

const FormWizard = () => {
  const [step, setStep] = useState(1);

  // Fonction de transition vers l'étape suivante
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  
  // Fonction de transition vers l'étape précédente
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="relative w-full max-w-md mx-auto">
      <AnimatePresence>
        {step === 1 && (
          <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          >
            <MassRequestForm nextStep={nextStep} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          >
            <OfferingForm nextStep={nextStep} prevStep={prevStep} />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          >
            <DonorForm prevStep={prevStep} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormWizard;