type TabColumn = {
  key: string;
  label: string;
  endpoint: string;
  columns?: Array<string>;
  formatters?: { [key: string]: (value: any) => string };
};

export const tabs: TabColumn[] = [
  {
    key: "donors",
    label: "Donateurs",
    endpoint: "http://localhost:3001/api/data/donors",
    columns: ["name", "address", "phone", "email", "amount"]
  },
  {
    key: "celebrants",
    label: "Prêtres",
    endpoint: "http://localhost:3001/api/data/celebrants",
    formatters: {
      is_available: (value: boolean) => value ? "Disponible" : "Indisponible",
    },
  },
  {
    key: "intentions",
    label: "Intentions",
    endpoint: "http://localhost:3001/api/data/intentions",
    formatters: { 
      amount: (value: number) => `${value} €`,
      date_requested: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
    },
  },
  {
    key: "masses",
    label: "Messes",
    endpoint: "http://localhost:3001/api/data/masses",
    formatters: {
      date: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
    },
  },
  {
    key: "special-days",
    label: "Jours spéciaux",
    endpoint: "http://localhost:3001/api/data/special-days",
    formatters: {
      date: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
    },
  },
];
