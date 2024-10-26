import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import FormProps from "../interfaces/formProps";







const MassRequestForm: React.FC<FormProps> = ({ nextStep }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateType, setDateType] = useState("indifferente");
  const [showCalendar, setShowCalendar] = useState(false);

  const [priests, setPriests] = useState<{ name: string; label: string }[]>([]);


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
    { value: "trentaine", label: "Trentain (30 messes)" }
  ];

  // const priests = [
  //   { value: "indifferent", label: "Indifférent" },
  //   { value: "pere1", label: "Père 1" },
  //   { value: "pere2", label: "Père 2" },
  //   { value: "pere3", label: "Père 3" }
  // ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  }

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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Intention */}
          <div className="space-y-2">
            <Label htmlFor="intention">Intention</Label>
            <Input id="intention" placeholder="Votre intention..." />
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
              />
              <Select>
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
              onValueChange={setDateType}
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

            {dateType !== "indifferente" && (
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? date.toLocaleDateString() : "Sélectionner une date"}
                </Button>
                {showCalendar && (
                  <div className="absolute mt-2 p-2 bg-white border rounded-md shadow-lg z-10">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date);
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
            <Label>Célébrant</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un célébrant" />
              </SelectTrigger>
              <SelectContent>
                {priests.map((priest) => (
                  <SelectItem key={priest.name} value={priest.name}>
                    {priest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" onClick={nextStep}>
            Suivant
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MassRequestForm;
