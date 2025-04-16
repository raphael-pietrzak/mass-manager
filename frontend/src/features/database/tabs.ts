type FormatterFunction = (value: any) => string;

type FormatterConfig = {
  type: 'boolean' | 'enum' | 'date';
  options?: { label: string; value: any }[];
  display?: FormatterFunction;
};

type TabColumn = {
  key: string;
  label: string;
  endpoint: string;
  columns?: Array<{ key: string; label: string }>;
  formatters?: Record<string, FormatterFunction | FormatterConfig>;
};

export const tabs: TabColumn[] = [
  {
    key: "donors",
    label: "Donateurs",
    endpoint: "http://localhost:3001/api/data/donors",
    columns: [
      { key: "lastname", label: "Nom" },
      { key: "firstname", label: "Prénom" },
      { key: "address", label: "Adresse" },
      { key: "city", label: "Ville" },
      { key: "zip_code", label: "Code postal" },
      { key: "phone", label: "Téléphone" },
      { key: "email", label: "Email" },
    ],
  },
  {
    key: "celebrants",
    label: "Prêtres",
    endpoint: "http://localhost:3001/api/data/celebrants",
    columns: [
      { key: "religious_name", label: "Nom religieux" },
      { key: "civil_firstname", label: "Prénom civil" },
      { key: "civil_lastname", label: "Nom civil" },
      { key: "title", label: "Titre" },
      { key: "role", label: "Rôle" },
    ],
  },
  {
    key: "masses",
    label: "Messes",
    endpoint: "http://localhost:3001/api/data/masses",
    columns: [
      { key: "date", label: "Date" },
      { key: "celebrant", label: "Célébrant" },
      { key: "donor", label: "Donateur" },
      { key: "intention", label: "Intention" },
      { key: "amount", label: "Montant" },
      { key: "deceased", label: "Pour un défunt" },
      { key: "status", label: "Statut" },   
    ],
    formatters: {
      donor: {
        type: 'string' as 'enum',
        display: (value) => {
          // Si 'value' est un objet avec des propriétés 'firstname' et 'lastname'
          if (value && value.firstname && value.lastname) {
            return `${value.firstname} ${value.lastname}`;  // Retourne le nom complet du donateur
          }
          // Si 'value' est une simple chaîne (par exemple un ID ou un nom)
          if (typeof value === 'string') {
            return value;  // Retourne la chaîne telle quelle
          }
          return 'Donateur inconnu';  // Si les données sont manquantes ou invalides
        }
      },
      date: {
        type: 'date',
        display: (value: string) => new Date(value).toLocaleDateString("fr-FR")
      },
      status: {
        type: 'enum',
        options: [
          { label: 'Planifiée', value: 'scheduled' },
          { label: 'En attente', value: 'pending' },
          { label: 'Annulée', value: 'cancelled' }
        ],
        display: (value: string) => {
          switch (value) {
            case "scheduled": return "Planifiée";
            case "pending": return "En attente";
            case "cancelled": return "Annulée";
            default: return value;
          }
        }
      },
      deceased: {
        type: 'boolean',
        options: [
          { label: 'Oui', value: 1 },
          { label: 'Non', value: 0 }
        ],
        display: (value: number) => {
          console.log('Valeur deceased:', value);
          return value ? "Oui" : "Non";
        }
      }
    }
  },
  {
    key: "special-days",
    label: "Jours spéciaux",
    endpoint: "http://localhost:3001/api/data/special-days",
    columns: [
      { key: "date", label: "Date" },
      { key: "description", label: "description" },
      { key: "number_of_masses", label: "Nombre de messes" },
      { key: "is_recurrent", label: "Récurrent" },
    ],
    formatters: {
      date: {
        type: 'date',
        display: (value: string) => new Date(value).toLocaleDateString("fr-FR")
      },
      is_recurrent: {
        type: 'boolean',
        options: [
          { label: 'Oui', value: 1 },
          { label: 'Non', value: 0 }
        ],
        display: (value: number) => value ? "Oui" : "Non"
      }
    }
  },
];
