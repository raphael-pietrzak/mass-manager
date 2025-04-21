import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

// Format de date utilisé par l'API (YYYY-MM-DD)
export const API_DATE_FORMAT = 'yyyy-MM-dd';
// Format d'affichage localisé (ex: 12 janvier 2023)
export const DISPLAY_DATE_FORMAT = 'P';

/**
 * Convertit un objet Date en chaîne au format YYYY-MM-DD
 */
export const formatDateForApi = (date?: Date | null): string | undefined => {
  if (!date) return undefined;
  return format(date, API_DATE_FORMAT);
};

/**
 * Convertit une chaîne YYYY-MM-DD en objet Date
 */
export const parseApiDate = (dateString?: string | null): Date | undefined => {
  if (!dateString) return undefined;
  return parse(dateString, API_DATE_FORMAT, new Date());
};

/**
 * Formatte une date pour l'affichage localisé
 */
export const formatDateForDisplay = (date?: Date | null): string => {
  if (!date) return 'Non définie';
  return format(date, DISPLAY_DATE_FORMAT, { locale: fr });
};
