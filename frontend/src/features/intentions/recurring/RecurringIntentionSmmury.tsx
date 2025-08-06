import { Button } from "../../../components/ui/button";

interface RecurringIntentionFormProps {
  nextStep: () => void;
  prevStep: () => void;
}

const RecurringIntentionSummury: React.FC<RecurringIntentionFormProps> = ({ nextStep, prevStep }) => {

  const handleNextStep = () => {
    nextStep();
  };

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-2 overflow-y-auto">
        Récapitulatif
      </div>
      {/* <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleNextStep}
        >
          Suivant
        </Button>
      </div> */}
      <div className="pt-6 flex justify-between space-x-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Précédent
        </Button>
        <Button type="button" onClick={handleNextStep}>
          Suivant
        </Button>
      </div>
    </div>
  )
}

export default RecurringIntentionSummury;