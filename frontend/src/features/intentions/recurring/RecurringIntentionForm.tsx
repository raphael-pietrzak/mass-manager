import { Label } from "@radix-ui/react-label";
import { Input } from "../../../components/ui/input";
import { AlertTriangle } from "lucide-react";
import { AlertDescription } from "../../../components/ui/alert";
import React, { useEffect, useState } from "react";
import { DropdownSearch } from "../../../components/DropdownSearch";
import { Button } from "../../../components/ui/button";
import { IntentionWithRecurrence } from "./RecurringIntentionModal";
import { Checkbox } from "../../../components/ui/checkbox";

interface DropdownOption {
  value: string;
  label: string;
}

interface RecurringIntentionFormProps {
  formData: Partial<IntentionWithRecurrence>
  updateFormData: (data: Partial<IntentionWithRecurrence>) => void;
  nextStep: () => void;
  celebrantOptions: DropdownOption[];
}

const RecurringIntentionForm: React.FC<RecurringIntentionFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  celebrantOptions,
}) => {

  const [errorIntentionText, setErrorIntentionText] = useState<string>();
  const handleNextStep = () => {
    if (!formData.intention_text || formData.intention_text.trim() === "") {
      setErrorIntentionText("L'intention est requise")
      return
    }
    setErrorIntentionText("")
    nextStep();
  };

  useEffect(() => {
    if (errorIntentionText) {
      const timer = setTimeout(() => {
        setErrorIntentionText("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorIntentionText]);

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-6 overflow-y-auto">
        {/* Intention */}
        <div className="space-y-2">
          <Label htmlFor="intention_text">
            Intention <span className="text-red-500">*</span>
          </Label>
          <Input
            id="intention_text"
            name="intention_text"
            value={formData.intention_text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ intention_text: e.target.value })}
            required
            placeholder="Votre intention..."
          />

          {errorIntentionText && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorIntentionText}</AlertDescription>
            </div>
          )}
        </div>

        {/* Type d'intention (défunt/vivant) */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="deceased"
            checked={formData.deceased}
            onCheckedChange={(checked: boolean) => updateFormData({ deceased: checked as boolean })}
          />
          <Label htmlFor="deceased">
            Intention pour un défunt
          </Label>
        </div>
        {/* Célébrant */}
        <div className="space-y-2">
          <Label>Célébrant</Label>
          <DropdownSearch
            options={celebrantOptions}
            value={formData.celebrant_id}
            onChange={(value: string) => updateFormData({ celebrant_id: value })}
            placeholder="Sélectionner un célébrant"
            searchType='celebrant'
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleNextStep}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}

export default RecurringIntentionForm;