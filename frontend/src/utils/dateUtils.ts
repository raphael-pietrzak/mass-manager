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

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, 'yyyy-MM-dd HH:mm', { locale: fr });
};

export const formatDisplayDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
};

// Extrait uniquement l'heure au format HH:mm
export const extractTimeOnly = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, 'HH:mm', { locale: fr });
};
