import { Canon, MassIntention } from './types';
import { addDays, format } from 'date-fns';

export const canons: Canon[] = [
  { id: '1', name: 'Chanoine Pierre' },
  { id: '2', name: 'Chanoine Jean' },
  { id: '3', name: 'Chanoine Michel' },
  { id: '4', name: 'Chanoine Paul' },
];

// Generate some mock data for the last 30 days
const generateMockIntentions = (): MassIntention[] => {
  const intentions: MassIntention[] = [];
  const startDate = new Date();
  const intentions_examples = [
    "Pour le repos de l'âme de Marie Dubois",
    "Action de grâce pour la famille Martin",
    "Pour les vocations sacerdotales",
    "Pour la guérison de Jean-Pierre",
    "En l'honneur de Saint Joseph",
    "Pour la paix dans le monde",
  ];

  for (let i = 0; i < 30; i++) {
    const date = addDays(startDate, -i);
    canons.forEach(canon => {
      if (Math.random() > 0.5) { // 50% chance to have an intention
        intentions.push({
          id: `${canon.id}-${format(date, 'yyyy-MM-dd')}`,
          canonId: canon.id,
          date: format(date, 'yyyy-MM-dd'),
          intention: intentions_examples[Math.floor(Math.random() * intentions_examples.length)],
          requestedBy: ['Famille Bernard', 'Paroisse Saint-Pierre', 'Marie-Claire', 'Association des fidèles'][Math.floor(Math.random() * 4)]
        });
      }
    });
  }
  return intentions;
};

export const mockIntentions = generateMockIntentions();