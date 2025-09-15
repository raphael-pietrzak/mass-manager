import { Info } from "lucide-react";
import { Masses } from "../../../api/intentionService";
import { Button } from "../../../components/ui/button";
import { IntentionWithRecurrence } from "./RecurringIntentionModal";

interface RecurringIntentionFormProps {
  nextStep: () => void;
  prevStep: () => void;
  data: Partial<IntentionWithRecurrence>
  previewData: Masses[];
  isLoading: boolean;
}

const RecurringIntentionSummury: React.FC<RecurringIntentionFormProps> = ({ nextStep, prevStep, data, previewData, isLoading }) => {

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-4 overflow-y-auto">
        <div className="border p-3 rounded-md mb-4 bg-gray-50">
          <p><span className="font-medium">Intention: </span>{data.intention_text} <span>{data.deceased ? '(Défunt)' : ''}</span></p>
          <p><span className="font-medium">Date de début:</span> {data.start_date}</p>
          <p>
            <span className="font-medium">Type de récurrence:</span>{" "}
            {data.type === "monthly"
              ? "Mensuelle"
              : data.type === "yearly"
                ? "Annuelle"
                : data.type === "relative_position"
                  ? "Position relative mensuelle"
                  : data.type}
          </p>
          <p><span className="font-medium">Type de fin: </span>
            {data.end_type !== 'no-end'
              ? data.end_type
              : 'Pas de date de fin (sauf suppression)'}
            {data.end_type === "occurrences" && (
              <span> ({data.occurrences}) </span>
            )}
            {data.end_type === "date" && (
              <span> ({data.end_date})</span>
            )}
          </p>
          {data.type === "relative_position" && (
            <p>
              <span className="font-medium">Jour: </span>
              {data.position && positionFr[data.position]} {data.weekday && weekdayFr[data.weekday]} du mois
            </p>
          )}
          <p>
            <span className="font-medium">Célébrant: </span>
            {data.celebrant_id ? data.celebrant_name : "Aléatoire"}
          </p>
        </div>

        <div className="flex-col relative mt-10">
          <h3 className="font-semibold text-lg mb-2 mt-4">Messes planifiées <span className="italic">({previewData.length})</span></h3>
          {/* Indicateur de défilement */}
          {previewData.length > 5 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 z-10 rounded-b-md"></div>
          )}

          <div className="overflow-auto max-h-[250px] border rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    #
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">
                    Célébrant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((mass, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500 truncate">
                      {mass.date || "Date à déterminer"}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500 truncate">
                      {mass.celebrant_title && mass.celebrant_name
                        ? `${mass.celebrant_title} ${mass.celebrant_name}`
                        : 'Non assigné'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {((data.end_type === "no-end" && data.type === "yearly") &&
          <div className="flex space-x-2 italic">
            <Info />
            <p>Chaque 1er de l'an, une messe sera créée et affectée à la même date pour dans 2ans</p>
          </div>
        )}
        {((data.end_type === "no-end" && data.type === "monthly" || data.type === "relative_position") &&
          <div className="flex space-x-2 italic">
            <Info />
            <p>Chaque 1er du mois, une messe sera créée et affectée au même jour du mois pour l'année suivante</p>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-between space-x-4">
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