import { Button } from "../../../components/ui/button";
import { IntentionWithRecurrence } from "./RecurringIntentionModal";

interface RecurringIntentionFormProps {
  nextStep: () => void;
  prevStep: () => void;
  data: Partial<IntentionWithRecurrence>
}

const RecurringIntentionSummury: React.FC<RecurringIntentionFormProps> = ({ nextStep, prevStep, data }) => {

  const handleNextStep = () => {
    nextStep();
  };

  const positionFr: Record<string, string> = {
    first: '1er',
    second: '2ème',
    third: '3ème',
    fourth: '4ème',
    last: 'dernier',
  };

  const weekdayFr: Record<string, string> = {
    monday: 'lundi',
    tuesday: 'mardi',
    wednesday: 'mercredi',
    thursday: 'jeudi',
    friday: 'vendredi',
    saturday: 'samedi',
    sunday: 'dimanche',
  };

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-2 overflow-y-auto">
        <div className="border p-3 rounded-md mb-4 bg-gray-50">
          <p><span className="font-medium">Intention: </span>{data.intention_text} <span>{data.deceased ? '(Défunt)' : ''}</span></p>
          <p><span className="font-medium">Date de début:</span> {data.start_date}</p>
          <p>
            <span className="font-medium">Type de récurrence:</span>{" "}
            {data.type === "monthly"
              ? "mensuelle"
              : data.type === "yearly"
                ? "annuelle"
                : data.type}
          </p>
          <p><span className="font-medium">Type de fin:</span> {data.end_type}</p>

          {data.end_type === "date" && (
            <p><span className="font-medium">Date de fin:</span> {data.end_date}</p>
          )}
          {data.end_type === "occurrences" && (
            <p><span className="font-medium">Nombre d'occurences:</span> {data.occurrences}</p>
          )}
          {data.type === "relative_position" && (
            <p>
              <span className="font-medium">Jour: </span>
              {data.position && positionFr[data.position]} {data.weekday && weekdayFr[data.weekday]} du mois
            </p>
          )}
        </div>
      </div>

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