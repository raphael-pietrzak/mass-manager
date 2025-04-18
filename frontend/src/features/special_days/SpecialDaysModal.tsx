import { useEffect, useState } from 'react';
import { SpecialDays } from '../../api/specialDaysService';
import { specialDayService } from '../../api/specialDaysService';
import { formatDisplayDate } from '../../utils/dateUtils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecialDaysModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [specialDays, setSpecialDays] = useState<SpecialDays[]>([]);
  const [editingDay, setEditingDay] = useState<SpecialDays | null>(null);
  const [newDay, setNewDay] = useState<SpecialDays>({
    date: '',
    description: '',
    number_of_masses: 0,
    is_recurrent: false,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showSpecialDays, setShowSpecialDays] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSpecialDays();
    } else {
      resetForm();
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
  

  const loadSpecialDays = async () => {
    try {
      const data = await specialDayService.getSpecialDays();
      console.log("Données chargées:", data); // Pour déboguer
      const sanitizedData = data.map((day) => ({
        ...day,
        date: day.date || '',
        description: day.description || '', // Assurez-vous d'utiliser description et non note
        number_of_masses: day.number_of_masses || 0,
        is_recurrent: day.is_recurrent ?? false,
      }));
      setSpecialDays(sanitizedData);
    } catch (error) {
      console.error("Erreur lors du chargement des jours spéciaux", error);
      setSpecialDays([]);
    }
  };

  const handleChange = (field: keyof SpecialDays, value: any) => {
    setNewDay((prev: any) => ({
      ...prev,
      [field]: field === 'number_of_masses' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    // Valider les champs obligatoires
    if (!newDay.date.trim()) {
      setValidationError("La date est obligatoire");
      return;
    }
    
    if (!newDay.description.trim()) {
      setValidationError("La description est obligatoire");
      return;
    }
    
    // Réinitialiser l'erreur si validation OK
    setValidationError(null);
    
    try {
      if (editingDay?.id) {
        const response = await specialDayService.updateSpecialDay(editingDay.id, newDay);
        setSuccessMessage(response);
      } else {
        const response = await specialDayService.createSpecialDays(newDay);
        setSuccessMessage(response);
      }
      await loadSpecialDays();
      resetForm();
    } catch (error) {
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
        await specialDayService.deleteSpecialDay(isDeleting);
        await loadSpecialDays();
        resetForm();
        setIsDeleting(null);
        setSuccessMessage("Jour particulier supprimé avec succès");
      } catch (error) {
        console.error('Erreur lors de la suppression du jour spécial', error);
      }
    }
  };

  const handleEdit = (day: SpecialDays) => {
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
    setNewDay({ date: '', description: '', number_of_masses: 0, is_recurrent: false });
    setIsDeleting(null);
    setIsConfirmingDelete(false);
    setSuccessMessage(undefined);
    setValidationError(null);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Jours particuliers</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          {editingDay && (
            <Button
              variant="outline"
              onClick={resetForm}
              className="gap-2"
            >
              <Plus size={16} /> Ajouter un jour
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Label htmlFor="showList">Afficher la liste</Label>
            <Switch 
              id="showList"
              checked={showSpecialDays}
              onCheckedChange={setShowSpecialDays}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Form section */}
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">{editingDay ? 'Modifier' : 'Ajouter'} un jour particulier</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date<span className="text-red-500"> *</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={newDay.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={validationError && !newDay.date.trim() ? "border-red-500" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description<span className="text-red-500"> *</span>
                </Label>
                <Input
                  id="description"
                  required
                  placeholder="ex : Noël ou Jeudi Saint"
                  value={newDay.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={validationError && !newDay.description.trim() ? "border-red-500" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="massCount">
                  Nombre de messes par prêtre
                </Label>
                <Input
                  id="massCount"
                  type="number"
                  required
                  min={0}
                  value={newDay.number_of_masses ?? ''}
                  onChange={(e) => handleChange('number_of_masses', e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurrent"
                  checked={newDay.is_recurrent ?? false}
                  onCheckedChange={(checked) => handleChange('is_recurrent', checked)}
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
          
          {/* Success message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-300 text-green-800">
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          {/* Delete confirmation */}
          {isConfirmingDelete && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>Confirmer la suppression</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">Êtes-vous sûr de vouloir supprimer ce jour particulier ? Cette action est irréversible.</p>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    // onClick={handleCancelDelete}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleConfirmDelete}
                  >
                    Supprimer
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Special days list */}
          {showSpecialDays && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-lg font-semibold flex gap-2 items-center">
                <Calendar size={18} /> Liste des jours particuliers
              </h3>
              
              {specialDays.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {specialDays.map((day) => (
                    <div
                      key={day.id}
                      onClick={() => handleEdit(day)}
                      className="p-3 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">
                          {day.is_recurrent
                            ? formatDateWithoutYear(day.date)
                            : formatDisplayDate(new Date(day.date).getTime())}{' '}
                          - {day.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {day.number_of_masses} messe(s)
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
                  Aucun jour particulier enregistré
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
