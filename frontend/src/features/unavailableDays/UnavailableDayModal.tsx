import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import CalendarSelector from '../../components/CalendarSelector';
import { UnavailableDays, unavailableDayService } from '../../api/unavailabledayService';
import { Celebrant, celebrantService } from '../../api/celebrantService';
import { DropdownSearch } from '../../components/DropdownSearch';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UnavailableDayModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [unavailableDays, setUnavailableDay] = useState<UnavailableDays[]>([]);
  const [editingDay, setEditingDay] = useState<UnavailableDays | null>(null);
  const [newDay, setNewDay] = useState<UnavailableDays>({
    celebrant_id: 0,
    date: '',
    is_recurrent: false,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showUnavailableDays, setShowUnavailableDays] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const celebrantOptions = celebrants.map((celebrant) => ({
    value: celebrant.id.toString(),
    label: `${celebrant.title} ${celebrant.religious_name}`
  }));
  const [selectedCelebrantId, setSelectedCelebrantId] = useState<number | null>(null); // célébrant sélectionné dans la liste

  const handleSelectCelebrant = (value: string) => {
    resetForm();
    const id = parseInt(value, 10);
    handleChange('celebrant_id', id);
  };

  const handleSelectFilterCelebrant = async (value: string) => {
    resetForm();
    const id = parseInt(value, 10);
    setSelectedCelebrantId(id);
  };

  useEffect(() => {
    if (isOpen) {
      loadUnavailableDays();
      fetchCelebrants();
      setUnavailableDay([]);
    } else {
      resetForm();
      setSelectedCelebrantId(null);
    }
  }, [selectedCelebrantId]);

  useEffect(() => {
    if (isOpen) {
      fetchCelebrants();
      setUnavailableDay([]);
    } else {
      resetForm();
      setSelectedCelebrantId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(undefined);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCelebrants = async () => {
    try {
      const data = await celebrantService.getCelebrants();
      setCelebrants(data);
    } catch (error) {
      console.error("Erreur lors du chargement des célébrants:", error);
    }
  };

  const loadUnavailableDays = async () => {
    try {
      if (!selectedCelebrantId) {
        setUnavailableDay([]);
        return;
      }
      const data = await unavailableDayService.getUnavailableDays(selectedCelebrantId);

      const uniqueRecurrentMap: Record<string, UnavailableDays> = {};
      const result: UnavailableDays[] = [];

      data.forEach((day) => {
        if (day.is_recurrent) {
          const key = new Date(day.date).toISOString().slice(5, 10); // MM-DD
          if (!uniqueRecurrentMap[key]) uniqueRecurrentMap[key] = day;
        } else {
          result.push(day);
        }
      });

      setUnavailableDay([...result, ...Object.values(uniqueRecurrentMap)]);
    } catch (error) {
      console.error("Erreur lors du chargement des jours spéciaux", error);
      setUnavailableDay([]);
    }
  };


  const handleChange = (field: keyof UnavailableDays, value: any) => {
    setNewDay((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Valider les champs obligatoires
    if (!newDay.date.trim()) {
      setValidationError("La date est obligatoire");
      return;
    }
    if (!newDay.celebrant_id) {
      setValidationError("Veuillez sélectionner un célébrant");
      return;
    }
    // Réinitialiser l'erreur si validation OK
    setValidationError(null);
    try {
      if (editingDay?.id) {
        const response = await unavailableDayService.updateUnavailableDay(editingDay.id, newDay);
        setSuccessMessage(response);
      } else {
        const response = await unavailableDayService.createUnavailableDay(newDay);
        setSuccessMessage(response);
      }
      await loadUnavailableDays();
    } catch (error: any) {
      setValidationError(error.message);
      console.error("Erreur lors de l'enregistrement du jour spécial", error);
    }
  };

  const handleDelete = (id: string) => {
    setIsDeleting(id);
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) {
      try {
        await unavailableDayService.deleteUnavailableDay(isDeleting);
        await loadUnavailableDays();
        resetForm();
        setIsDeleting(null);
        setSuccessMessage("Jour particulier supprimé avec succès");
      } catch (error) {
        console.error('Erreur lors de la suppression du jour spécial', error);
      }
    }
  };

  const handleEdit = (day: UnavailableDays) => {
    setEditingDay(day);
    setNewDay({ ...day });
  };

  const formatDateWithoutYear = (date: string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
    return d.toLocaleDateString('fr-FR', options);
  };

  const resetForm = () => {
    setEditingDay(null);
    setNewDay({ celebrant_id: 0, date: '', is_recurrent: false });
    setIsDeleting(null);
    setIsConfirmingDelete(false);
    setSuccessMessage(undefined);
    setValidationError(null);
  };

  const handleCloseConfirmDelete = () => {
    setIsConfirmingDelete(false); // Ferme la fenêtre de confirmation
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Jours indisponibles</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Colonne gauche : Formulaire */}
          <div className="w-1/2 flex flex-col overflow-y-auto pr-2">
            <div className="flex items-center justify-between mb-4">
              {editingDay && (
                <Button variant="outline" onClick={resetForm} className="gap-2">
                  <Plus size={16} /> Ajouter un jour
                </Button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Label htmlFor="showList">Afficher la liste</Label>
                <Switch
                  id="showList"
                  checked={showUnavailableDays}
                  onCheckedChange={setShowUnavailableDays}
                />
              </div>
            </div>

            <div className="space-y-6">
              <Separator />
              <h3 className="text-lg font-semibold">{editingDay ? 'Modifier' : 'Ajouter'} un jour indisponible</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="celebrant">
                    Célébrant<span className="text-red-500"> *</span>
                  </Label>
                  <DropdownSearch
                    options={celebrantOptions}
                    value={newDay.celebrant_id ? newDay.celebrant_id.toString() : undefined}
                    onChange={handleSelectCelebrant}
                    placeholder="Sélectionner un célébrant"
                    disabled={!!editingDay}
                    searchType='celebrant'
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date<span className="text-red-500"> *</span>
                  </Label>
                  <CalendarSelector
                    selectedDate={newDay.date ? new Date(newDay.date) : undefined}
                    onDateChange={(date: Date | undefined) =>
                      handleChange('date', date ? date.toISOString().split('T')[0] : '')
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurrent"
                    checked={newDay.is_recurrent ?? false}
                    onCheckedChange={(checked: boolean) => handleChange('is_recurrent', checked)}
                    disabled={!!editingDay}
                  />
                  <Label htmlFor="recurrent">Récurrent chaque année</Label>
                </div>

                {validationError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    onClick={handleSave}
                  >
                    {editingDay ? 'Mettre à jour' : 'Ajouter'}
                  </Button>

                  {editingDay && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(editingDay.id!)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trait vertical de séparation */}
          <div className="w-px bg-gray-200" />

          {/* Colonne droite : Liste */}
          {showUnavailableDays && (
            <div className="w-1/2 flex flex-col overflow-y-auto pl-2 gap-4">
              <h3 className="text-lg font-semibold flex gap-2 items-center mb-2">
                <Calendar size={18} /> Liste des jours indisponibles
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Sélection du célébrant</label>
                <DropdownSearch
                  options={celebrantOptions}
                  value={selectedCelebrantId?.toString()}
                  onChange={handleSelectFilterCelebrant}
                  placeholder="Sélectionner un célébrant"
                  searchType='celebrant'
                />
              </div>

              {selectedCelebrantId === null ? (
                <div className="text-center p-4 text-gray-500">
                  Veuillez sélectionner un célébrant.
                </div>
              ) : unavailableDays.length > 0 ? (
                <div className="space-y-2">
                  {unavailableDays.map((day) => (
                    <div
                      key={day.id}
                      onClick={() => handleEdit(day)}
                      className="p-3 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">
                          {day.is_recurrent
                            ? formatDateWithoutYear(day.date)
                            : new Date(day.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                        </div>
                      </div>
                      <Badge variant={day.is_recurrent ? "secondary" : "outline"}>
                        {day.is_recurrent ? 'Récurrent' : 'Unique'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  Aucun jour indisponible enregistré
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 space-y-4">
          {/* Success message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-300 text-green-800">
              <AlertTitle>✓ Succès</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Delete confirmation */}
          {isConfirmingDelete && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>Confirmer la suppression</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer ce jour indisponible ? Cette action est irréversible.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCloseConfirmDelete}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={handleConfirmDelete}>
                    Supprimer
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
