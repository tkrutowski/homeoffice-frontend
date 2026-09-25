import type { LogLevel } from '@/features/admin/logs/types';

/**
 * Kolory poziomów z makiety, przełożone na tokeny Tailwind/Prime z wariantami light + dark.
 * Pełne nazwy klas (bez składania stringów) - inaczej Tailwind ich nie wykryje.
 */
export interface LogLevelStyle {
  /** Plakietka poziomu (tło + kontrastowy tekst). */
  badge: string;
  /** Kropka na chipie filtra. */
  dot: string;
  /** Obramowanie aktywnego chipa. */
  border: string;
  /** Delikatne tło całego wiersza tabeli. */
  row: string;
  /** Kolor komunikatu. */
  message: string;
}

export const LOG_LEVEL_STYLES: Record<LogLevel, LogLevelStyle> = {
  ERROR: {
    badge: 'bg-red-600 text-white dark:bg-red-400 dark:text-surface-950',
    dot: 'bg-red-600 dark:bg-red-400',
    border: 'border-red-600 dark:border-red-400',
    row: 'bg-red-500/10 dark:bg-red-400/10',
    message: 'text-red-700 dark:text-red-300',
  },
  WARN: {
    badge: 'bg-amber-500 text-surface-950 dark:bg-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
    border: 'border-amber-500 dark:border-amber-400',
    row: 'bg-amber-500/10 dark:bg-amber-400/5',
    message: 'text-surface-800 dark:text-surface-100',
  },
  INFO: {
    badge: 'bg-sky-600 text-white dark:bg-sky-400 dark:text-surface-950',
    dot: 'bg-sky-600 dark:bg-sky-400',
    border: 'border-sky-600 dark:border-sky-400',
    row: '',
    message: 'text-surface-800 dark:text-surface-100',
  },
  DEBUG: {
    badge: 'bg-surface-500 text-white dark:bg-surface-300 dark:text-surface-950',
    dot: 'bg-surface-500 dark:bg-surface-300',
    border: 'border-surface-500 dark:border-surface-300',
    row: '',
    message: 'text-surface-700 dark:text-surface-200',
  },
  TRACE: {
    badge: 'bg-surface-400 text-surface-950 dark:bg-surface-500 dark:text-white',
    dot: 'bg-surface-400 dark:bg-surface-500',
    border: 'border-surface-400 dark:border-surface-500',
    row: '',
    message: 'text-surface-600 dark:text-surface-300',
  },
};
