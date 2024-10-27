import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types
interface Celebrant {
  id: string;
  name: string;
}

interface Intention {
  id: string;
  description: string;
}

interface DaySchedule {
  date: Date;
  celebrant: Celebrant;
  intention: Intention;
}

const CalendarView = () => {
  // État pour stocker le mois sélectionné
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  
  // État pour stocker les détails de l'intention sélectionnée
  // const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null);

  // Générer la liste des 24 prochains mois
  const getNext24Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      });
    }
    return months;
  };

  // Données factices pour l'exemple
  const celebrants: Celebrant[] = [
    { id: "1", name: "Père Jean" },
    { id: "2", name: "Père Pierre" },
    { id: "3", name: "Père Jacques" }
  ];

  // Générer les jours du mois sélectionné
  const getDaysInMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const days: DaySchedule[] = [];
    
    while (date.getMonth() === parseInt(month) - 1) {
      days.push({
        date: new Date(date),
        celebrant: celebrants[Math.floor(Math.random() * celebrants.length)],
        intention: {
          id: date.toISOString(),
          description: `Intention pour le ${date.toLocaleDateString('fr-FR')}`
        }
      });
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="w-full max-w-xs">
        <Select
          value={selectedMonth}
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez un mois" />
          </SelectTrigger>
          <SelectContent>
            {getNext24Months().map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {celebrants.map(celebrant => (
              <TableHead key={celebrant.id}>{celebrant.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {getDaysInMonth().map((day) => (
            <TableRow key={day.date.toISOString()}>
              <TableCell>
                {day.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}
              </TableCell>
              {celebrants.map(celebrant => (
                <TableCell 
                  key={celebrant.id}
                  className={`cursor-pointer ${
                    day.celebrant.id === celebrant.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <Dialog>
                    <DialogTrigger className="w-full h-full text-left">
                      {day.celebrant.id === celebrant.id && (
                        <div className="p-2">
                          <div className="text-sm font-medium">Intention assignée</div>
                        </div>
                      )}
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Détails de l'intention - {day.date.toLocaleDateString('fr-FR')}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p><strong>Célébrant :</strong> {day.celebrant.name}</p>
                        <p><strong>Intention :</strong> {day.intention.description}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CalendarView;