import React from 'react';
import { Button } from '@/components/ui/button';
import { Intention, Masses } from '../../../api/intentionService';

interface SummaryFormProps {
  previewData: Masses[];
  isLoading: boolean;
  formData: Partial<Intention>;
  celebrantOptions: { value: string; label: string }[];
  onValidate: () => void;
  onEdit: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const SummaryForm: React.FC<SummaryFormProps> = ({
  previewData,
  isLoading,
  formData,
  celebrantOptions,
  nextStep,
  prevStep,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!previewData || previewData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Aucune messe n'a été générée. Veuillez vérifier vos critères.</p>
        <Button variant="outline" onClick={prevStep}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-auto h-full flex flex-col">
      <div className="flex-grow overflow-hidden">
        <h3 className="font-semibold text-lg mb-2 mt-4">Intention à créer</h3>

        {/* Informations communes à toutes les messes */}
        <div className="border p-3 rounded-md mb-4 bg-gray-50">
          <p><span className="font-medium">Intention: </span>{formData.intention_text} <span>{formData.deceased ? '(Défunt)' : ''}</span></p>
          <p><span className="font-medium">Date:</span> {(formData.date_type === 'imperative' || formData.date_type === 'desired') ? 'Fixe' : 'Mobile'}</p>
          <p>
            <span className="font-medium">Type:</span>{" "}
            {formData.intention_type === "unit" ? (
              `Unité${formData.mass_count && formData.mass_count > 1 ? ` (${formData.mass_count} Messes)` : " (1 Messe)"}`
            ) : formData.intention_type === "novena" ? (
              "Neuvaine"
            ) : formData.intention_type === "thirty" ? (
              "Trentain"
            ) : (
              "Mobile"
            )}
          </p>
        </div>

        {(formData.date_type === 'imperative' || formData.date_type === 'desired' || formData.date_type === 'indifferent') && (
          <div className="flex-col relative mt-10">
            <h3 className="font-semibold text-lg mb-2 mt-4">Messes planifiées</h3>
            {/* Indicateur de défilement */}
            {previewData.length > 5 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none z-10 rounded-b-md"></div>
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
                        {mass.celebrant_title} {mass.celebrant_name || (celebrantOptions.find(c => c.value === mass.celebrant_id)?.label || 'Non assigné')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Texte d'indication de défilement si plusieurs éléments - Style amélioré */}
            {previewData.length > 5 && (
              <p className="text-sm text-gray-600 mt-2 text-center font-medium bg-gray-100 p-1 rounded border border-gray-200">
                Faites défiler pour voir toutes les messes ({previewData.length} au total)
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between space-x-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Précédent
        </Button>
        <Button type="button" onClick={nextStep}>
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default SummaryForm;
