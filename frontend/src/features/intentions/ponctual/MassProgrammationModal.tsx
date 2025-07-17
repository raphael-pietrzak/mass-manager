import { useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Intention, Masses } from "../../../api/intentionService";

interface MassProgrammationModalProps {
  intentions: Intention[];
  masses: Masses[];
  onClose: () => void;
}

export const MassProgrammationModal: React.FC<MassProgrammationModalProps> = ({
  intentions,
  masses,
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => currentSlide > 0 && setCurrentSlide(currentSlide - 1);
  const nextSlide = () => currentSlide < intentions.length - 1 && setCurrentSlide(currentSlide + 1);
  const finalize = () => onClose();

  const currentIntention = intentions[currentSlide];
  const currentMasses = masses.filter(m => String(m.intention_id) === String(currentIntention.id));
  const progressPercentage = ((currentSlide + 1) / intentions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-xl w-full mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Répartition des intentions ponctuelles – {currentSlide + 1}/{intentions.length}
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barre de progression dans le même style */}
          <div className="w-full bg-muted h-2 rounded-full mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="h-[600px] flex flex-col justify-between">
          {/* <div className="flex-grow flex items-center justify-center text-2xl font-semibold">
            {currentIntention.intention_text}
          </div> */}

          {currentMasses.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-black">
              <h3 className="font-semibold text-lg mb-2 mt-4">Récapitulatif de l'intention</h3>
              {/* Informations communes à toutes les messes */}
              <div className="border p-3 rounded-md mb-4 bg-gray-50">
                <p>
                  <span className="font-medium">Intention: </span>{currentIntention.intention_text}
                  <span>{currentIntention.deceased ? '(Défunt)' : ''}</span>
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {currentIntention.intention_type === "unit" ? (
                    `Unité${currentIntention.mass_count && currentIntention.mass_count > 1 ? ` (${currentIntention.mass_count} Messes)` : " (1 Messe)"}`
                  ) : currentIntention.intention_type === "novena" ? (
                    "Neuvaine"
                  ) : currentIntention.intention_type === "thirty" ? (
                    "Trentain"
                  ) : (
                    "Mobile"
                  )}
                </p>
              </div>

              <div className="flex-col relative mt-10">
                <h3 className="font-semibold text-lg mb-2 mt-4">Messes planifiées</h3>
                {/* Indicateur de défilement */}
                {currentMasses.length > 5 && (
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
                      {currentMasses.map((mass, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500 truncate">
                            {/* {mass.date || "Date à déterminer"} */}
                            DATE
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500 truncate">
                            {/* {mass.celebrant_title} {mass.celebrant_name || (celebrantOptions.find(c => c.value === mass.celebrant_id)?.label || 'Non assigné')} */}
                            CELEBRANT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Texte d'indication de défilement si plusieurs éléments - Style amélioré */}
                {currentMasses.length > 5 && (
                  <p className="text-sm text-gray-600 mt-2 text-center font-medium bg-gray-100 p-1 rounded border border-gray-200">
                    Faites défiler pour voir toutes les messes ({currentMasses.length} au total)
                  </p>
                )}
              </div>
            </ul>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Aucune messe associée à cette intention.
            </div>
          )}

          <div className="pt-6 flex justify-between space-x-4">
            {currentSlide > 0 ? (
              <Button variant="outline" onClick={prevSlide}>
                Précédent
              </Button>
            ) : (
              <div /> // Espace pour alignement
            )}

            <Button
              variant="default"
              onClick={currentSlide === intentions.length - 1 ? finalize : nextSlide}
            >
              {currentSlide === intentions.length - 1 ? "Finaliser" : "Suivant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div >
  );
};
