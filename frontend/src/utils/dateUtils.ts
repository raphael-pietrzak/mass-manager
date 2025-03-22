import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, 'yyyy-MM-dd', { locale: fr });
};

export const formatDisplayDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, 'dd MMMM yyyy', { locale: fr });
};
