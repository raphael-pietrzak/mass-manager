import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription } from "@/components/ui/alert";

const RegularityForm = () => {

interface FormData {
    day: string;
    month: string;
    expirationDate: Date | null;
  }
    
  const [formData, setFormData] = React.useState<FormData>({
    day: '',
    month: '',
    expirationDate: null
  });

  // Générer les jours (1-31)
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // Liste des mois en français
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  // Détermine le message explicatif basé sur les sélections
  const getExplanation = () => {
    if (!formData.day && formData.month) {
      return `Paiement prévu n'importe quand en ${formData.month}`;
    } else if (formData.day && !formData.month) {
      return `Paiement prévu le ${formData.day} de chaque mois`;
    } else if (!formData.day && !formData.month) {
      return "Paiement prévu n'importe quand dans l'année";
    } else {
      return `Paiement prévu le ${formData.day} ${formData.month}`;
    }
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Données du formulaire:', formData);
    console.log('Explication:', getExplanation());
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Informations sur la régularité</CardTitle>
      </CardHeader>
      <CardContent>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="day">Jour</Label>
            <Select
              value={formData.day}
              onValueChange={(value: string) => setFormData({ ...formData, day: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un jour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Vide</SelectItem>
                {days.map((day: string) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Mois</Label>
            <Select
              value={formData.month}
              onValueChange={(value: string) => setFormData({ ...formData, month: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Vide</SelectItem>
                {months.map((month: string) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expiration</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expirationDate ? (
                    format(formData.expirationDate, 'P', { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expirationDate}
                  onSelect={(date: Date) => setFormData({ ...formData, expirationDate: date })}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Alert>
            <AlertDescription>
              {getExplanation()}
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full">
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegularityForm;