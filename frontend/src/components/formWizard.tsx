import React from 'react';
import OfferingForm from './OfferingForm';
import DonorForm from './DonorForm';

const FormWizard = () => {
  const [currentStep, setCurrentStep] = React.useState(1);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div>
      {currentStep === 1 && <OfferingForm onNext={handleNext} />}
      {currentStep === 2 && <DonorForm onNext={handleNext} onPrevious={handlePrevious} />}
      {/* Ajoutez ici votre troisième formulaire */}
    </div>
  );
};

export default FormWizard;