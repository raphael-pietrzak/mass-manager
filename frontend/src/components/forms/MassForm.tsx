import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { FormData } from "./formWizard";


interface FormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormProps["formData"]>) => void;
  nextStep: () => void;
}


const MassRequestForm: React.FC<FormProps> = ({ nextStep, formData, updateFormData }) => {


  const [showCalendar, setShowCalendar] = useState(false);
  const [priests, setPriests] = useState<{ name: string; id: number }[]>([]);



  useEffect(() => {
    // Récupère les données depuis l'API
    fetch("http://localhost:3001/api/data/celebrants")
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        return response.json();
      })
      .then((data) => {
        setPriests(data || []);
      })
      .catch((error) => {
        console.error("Erreur:", error);
      });
  }, []);

  const massTypes = [
    { value: "unite", label: "Unité" },
    { value: "neuvaine", label: "Neuvaine (9 messes)" },
    { value: "trentain", label: "Trentain (30 messes)" }
  ];



  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Demande de messe</CardTitle>
          <span className="text-sm text-muted-foreground">
            Étape 1 sur 3
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full mt-4">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: '33.33%' }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Intention */}
          <div className="space-y-2">
            <Label htmlFor="intention">Intention</Label>
            <Input id="intention" placeholder="Votre intention..." onChange={(e:React.ChangeEvent<HTMLInputElement>) => updateFormData({ intention: e.target.value })} />
          </div>

          {/* Nombre de messes */}
          <div className="space-y-2">
            <Label htmlFor="massCount">Nombre de messes</Label>
            <div className="flex gap-4">
              <Input 
                id="massCount" 
                type="number" 
                min="1" 
                className="w-24"
                value={formData.massCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ massCount: parseInt(e.target.value) })}
              />
              <Select onValueChange={(value: string) => updateFormData({ massType: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de messe" />
                </SelectTrigger>
                <SelectContent>
                  {massTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-4">
            <Label>Type de date</Label>
            <RadioGroup 
              defaultValue="indifferente" 
              onValueChange={(value: string) => updateFormData({ dateType: value })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indifferente" id="indifferente" />
                <Label htmlFor="indifferente">Indifférente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="souhaitee" id="souhaitee" />
                <Label htmlFor="souhaitee">Souhaitée</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperative" id="imperative" />
                <Label htmlFor="imperative">Impérative</Label>
              </div>
            </RadioGroup>

            { formData.dateType !== "indifferente" && (
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();  // Prevents form submission
                    setShowCalendar(!showCalendar);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    formData.date.toLocaleDateString()
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
                {showCalendar && (
                  <div className="absolute mt-2 p-2 bg-white border rounded-md shadow-lg z-10">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date: Date) => {
                        updateFormData({ date });
                        setShowCalendar(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Célébrant */}
          <div className="space-y-2">
            <Label>Chanoine</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un chanoine" />
              </SelectTrigger>
              <SelectContent>
                {priests.map((priest) => (
                  <SelectItem key={priest.id} value={priest.name} onClick={() => updateFormData({ celebrant: priest.name })}>
                    {priest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="button" className="w-full" onClick={nextStep}>
            Suivant
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MassRequestForm;
