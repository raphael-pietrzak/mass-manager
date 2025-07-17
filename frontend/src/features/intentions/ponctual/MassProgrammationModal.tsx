import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Intention, intentionService, Masses } from "../../../api/intentionService";

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

  const [previewData, setPreviewData] = useState<Masses[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPreviewMasses = async () => {
      setIsLoading(true);
      try {
        const allPreviews = await Promise.all(
          intentions.map((intention) =>
            intentionService.previewMassesForPonctualIntentions({
              intention_text: intention.intention_text,
              deceased: intention.deceased,
              mass_count: intention.mass_count || 1,
              intention_type: intention.intention_type,
              celebrant_id: intention.celebrant_id || '',
            })
          )
        );

        const merged = allPreviews.flat();
        setPreviewData(merged);
      } catch (err) {
        console.error("Erreur lors de la prévisualisation groupée :", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviewMasses();
  }, [intentions]);


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

          <div className="space-y-6">
            <h3 className="font-semibold text-lg mb-2">Messes prévisualisées</h3>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              </div>
            ) : previewData.length === 0 ? (
              <p className="text-sm text-gray-600 italic">Aucune messe générée</p>
            ) : (
              <div className="overflow-auto max-h-[300px] border rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase tracking-wider w-[10%]">#</th>
                      <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase tracking-wider w-[40%]">Date</th>
                      <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase tracking-wider w-[50%]">Célébrant</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((mass, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{mass.date || 'Non définie'}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          {mass.celebrant_title} {mass.celebrant_name || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>


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
