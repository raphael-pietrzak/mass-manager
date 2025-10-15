import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Calendar, Edit, User, X } from 'lucide-react';
import { IntentionWithRecurrence } from '../RecurringIntentionModal';
import { intentionService, Masses } from '../../../../api/intentionService';
import { MassModal } from '../../../calendar/MassModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { fr } from 'date-fns/locale';
import { Mass, massService } from '../../../../api/massService';
import { format } from 'date-fns';

interface RecurrenceMassModalEditProps {
  intention: IntentionWithRecurrence;
  masses: Masses[]
  onClose: () => void
  onUpdateIntention: (data: Partial<IntentionWithRecurrence>) => void;
}

const RecurringIntentionMassModalEdit: React.FC<RecurrenceMassModalEditProps> = ({
  intention,
  masses,
  onClose,
  onUpdateIntention
}) => {

  const [errorIntentionText, setErrorIntentionText] = useState<string>();
  const [isMassModalOpen, setIsMassModalOpen] = useState(false);
  const [selectedMass, setSelectedMass] = useState<Partial<Mass> | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [massToDelete, setMassToDelete] = useState<Masses | null>(null);
  const [localMasses, setLocalMasses] = useState<Masses[]>(masses);
  const [localIntention, setLocalIntention] = useState<IntentionWithRecurrence>(intention);

  useEffect(() => {
    setLocalMasses(masses);
  }, [masses]);

  useEffect(() => {
    setLocalIntention(intention);
  }, [intention]);

  useEffect(() => {
    if (errorIntentionText) {
      const timer = setTimeout(() => {
        setErrorIntentionText("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorIntentionText]);

  const handleSave = async () => {
    if (!localIntention.intention_text || localIntention.intention_text.trim() === "") {
      setErrorIntentionText("L'intention est requise")
      return
    }
    setErrorIntentionText("")
    onUpdateIntention({
      intention_text: localIntention.intention_text,
      deceased: localIntention.deceased,
    });
    onClose()
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalIntention(prev => ({
      ...prev,
      intention_text: e.target.value,
    }));
  };

  const handleDeceasedChange = (checked: boolean) => {
    setLocalIntention(prev => ({
      ...prev,
      deceased: checked === true,
    }));
  };

  const handleEditMassClick = (mass: Masses) => {
    const partialMass: Partial<Mass> = {
      id: mass.id,
      date: mass.date || "",
      celebrant_id: mass.celebrant_id || "",
      celebrant_religious_name: mass.celebrant_name,
      celebrant_title: mass.celebrant_title,
      dateType: intention.date_type,
      status: mass.status,
      random_celebrant: mass.random_celebrant
    };
    setSelectedMass(partialMass);
    setIsMassModalOpen(true);
  };

  const handleSaveMass = async (updatedMass: Partial<Mass>) => {
    await massService.updateMass(updatedMass);
    if (intention.id) {
      const updatedMasses = await intentionService.getIntentionMasses(intention.id);
      setLocalMasses(updatedMasses)
    }
    setIsMassModalOpen(false);
    setSelectedMass(null);
  }

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setMassToDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex w-full items-center justify-center z-50">
      <Card className="max-w-4xl w-full mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Modifier l'intention
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="h-[600px] flex flex-col">
          <div className="space-y-4 flex-shrink-0">
            {/* Intention */}
            <div className="space-y-2">
              <Label htmlFor="intention_text">
                Intention <span className="text-red-500">*</span>
              </Label>
              <Input
                id="intention_text"
                name="intention_text"
                value={localIntention.intention_text}
                onChange={handleTextChange}
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
                checked={localIntention.deceased}
                onCheckedChange={handleDeceasedChange}
              />
              <Label htmlFor="deceased">
                Intention pour un défunt
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <div>
                {intention.intention_type === "unit" ? (
                  <>
                    <span className="px-2 py-0.5 rounded-full text-base bg-blue-100 text-blue-700">
                      Unité
                    </span>
                  </>
                ) : intention.intention_type === "thirty" ? (
                  <span className="px-2 py-0.5 rounded-full text-base bg-blue-100 text-blue-700">
                    Trentain
                  </span>
                ) : intention.intention_type === "novena" ? (
                  <span className="px-2 py-0.5 rounded-full text-base bg-blue-100 text-blue-700">
                    Neuvaine
                  </span>
                ) : null}
              </div>
              <div>
                {(() => {
                  const dateTypeConfig = {
                    indifferent: { label: 'mobile', color: 'bg-blue-100 text-blue-800' },
                    imperative: { label: 'fixe', color: 'bg-red-100 text-red-800' },
                    desired: { label: 'fixe', color: 'bg-red-100 text-red-800' },
                  };
                  type DateTypeKey = keyof typeof dateTypeConfig;
                  const dateType: DateTypeKey = (intention.date_type === 'indifferent' || intention.date_type === 'imperative' || intention.date_type === 'desired')
                    ? intention.date_type
                    : 'indifferent';
                  const config = dateTypeConfig[dateType];
                  // Déterminer le suffixe à ajouter
                  return (
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-base ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col overflow-hidden mt-6">
            <h4 className="font-medium mb-3">
              {localMasses.length === 1 ? "Messe associée" : "Messes associées"}
            </h4>
            {localMasses.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg text-center text-yellow-700">
                Aucune messe associée à cette intention
              </div>
            ) : (
              <div className="bg-white shadow overflow-y-auto rounded border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Célébrant
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {localMasses.map((mass, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                            <span>{mass.date ? format(new Date(mass.date), 'EEE d MMM yyyy', { locale: fr }) : "Non définie"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <User className="w-3 h-3 text-gray-400 mr-1.5" />
                            <span>{mass.celebrant_title} {mass.celebrant_name || "Non assigné"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {mass.status === 'scheduled' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                              Programmée
                            </span>
                          )}
                          {mass.status === 'cancelled' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                              Annulée
                            </span>
                          )}
                          {mass.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">
                              En attente
                            </span>
                          )}
                          {mass.status === 'completed' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                              Célébrée
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  handleEditMassClick(mass);
                                }}
                                className={`p-1 text-gray-400 rounded-full transition-colors ${(intention.intention_type === "unit"
                                  ? (mass?.random_celebrant === 1 || intention.date_type === "indifferent")
                                  : (intention.intention_type == null && mass?.random_celebrant === 1))
                                  ? "hover:text-blue-500 hover:bg-gray-100"
                                  : "invisible"
                                  }`}
                                title="Modifier cette messe"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 flex-shrink-0">
            <div>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Annuler
              </Button>
            </div>
            <div>
              <Button
                type="button"
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modale de confirmation de suppression */}
      {isConfirmModalOpen && massToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-medium">Confirmer la suppression</h3>
              <button
                onClick={cancelDelete}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">Supprimer cette messe ?</h4>
                  <p className="text-sm text-gray-500">
                    Cette action est irréversible. Toutes les informations liées à cette messe seront définitivement supprimées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MassModal
        isOpen={isMassModalOpen}
        onClose={() => setIsMassModalOpen(false)}
        onSave={handleSaveMass}
        mass={selectedMass}
      />
    </div>
  );
};

export default RecurringIntentionMassModalEdit;
