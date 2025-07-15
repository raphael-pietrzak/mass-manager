import { useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MassProgrammationModalProps {
  onClose: () => void;
  slidesCount: number;
}

export const MassProgrammationModal: React.FC<MassProgrammationModalProps> = ({
  onClose,
  slidesCount,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => currentSlide > 0 && setCurrentSlide(currentSlide - 1);
  const nextSlide = () => currentSlide < slidesCount - 1 && setCurrentSlide(currentSlide + 1);
  const finalize = () => onClose();

  const progressPercentage = ((currentSlide + 1) / slidesCount) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-xl w-full mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Répartition des messes ponctuelles – {currentSlide + 1}/{slidesCount}
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
          <div className="flex-grow flex items-center justify-center text-2xl font-semibold">
            Slide {currentSlide + 1}
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
              onClick={currentSlide === slidesCount - 1 ? finalize : nextSlide}
            >
              {currentSlide === slidesCount - 1 ? "Finaliser" : "Suivant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
