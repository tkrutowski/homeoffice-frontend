import { useBookstoreStore } from '../stores/bookstores';
import { useCardsStore } from '../stores/cards';
import { useFirmsStore } from '../stores/firms';
import { type Author, type Category } from '../types/Book';
import { OwnershipStatus, EditionType, ReadingStatus } from '../types/Book';
import moment from 'moment';
import type { FeeInstallment } from '../types/Fee';
import type { Installment } from '../types/Payment';
import type { LoanInstallment } from '../types/Loan';
import { TranslationService } from '@/service/TranslationService.ts';

export const UtilsService = {
  /** Kwota w formacie polskim zawsze z sufiksem „zł” (Intl bywa niespójny między przeglądarkami / locale). */
  formatCurrency(value: number | string | undefined | null) {
    if (value === undefined || value === null) return undefined;
    const n = Number(value);
    if (Number.isNaN(n)) return undefined;
    const formatted = n.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted} zł`;
  },

  formatDateToString(value: Date | string | undefined): string {
    // console.log('formatDateToString', value);
    if (value) {
      const date = moment(value).format('YYYY-MM-DD');
      return date === '0001-01-01' ? '' : date;
    }
    return '';
  },

  /**
   * Maska numeru konta: ostatnie 4 znaki alfanumeryczne, reszta jako gwiazdki w grupach.
   * Pusty lub niepoprawny ciąg zwraca pusty string.
   */
  maskAccountNumber(account: string | null | undefined): string {
    if (account == null || account.trim() === '') return '';
    const digits = account.replace(/\s/g, '').replace(/[^0-9A-Za-z]/g, '');
    if (digits.length === 0) return '';
    const last = digits.slice(-4);
    return `**** **** ${last}`;
  },

  formatDate(value: Date | string | undefined): Date | undefined {
    if (value) {
      const date = moment(value).format('YYYY-MM-DD');
      return date === '0001-01-01' ? undefined : new Date(date);
    }
  },

  /** Liczba pełnych dni kalendarzowych po terminie spłaty (względem dziś). `null` gdy brak daty lub termin jeszcze nie minął. */
  daysPastDeadline(deadline: Date | string | null | undefined): number | null {
    if (deadline === null || deadline === undefined) return null;
    const end = moment(deadline).startOf('day');
    if (!end.isValid()) return null;
    const today = moment().startOf('day');
    const diff = today.diff(end, 'days');
    return diff > 0 ? diff : null;
  },

  /** Pełne dni kalendarzowe do terminu (włącznie z dziś = 0). `null` gdy brak daty lub termin już minął. */
  daysUntilDeadline(deadline: Date | string | null | undefined): number | null {
    if (deadline === null || deadline === undefined) return null;
    const end = moment(deadline).startOf('day');
    if (!end.isValid()) return null;
    const today = moment().startOf('day');
    const diff = end.diff(today, 'days');
    return diff >= 0 ? diff : null;
  },

  //zaznacza tekst po kliknięciu
  selectText(event: Event) {
    if (event.target && event.target instanceof HTMLInputElement) {
      event.target.select();
    }
  },

  getTypesForLibrary() {
    const bookstoreStore = useBookstoreStore();
    if (bookstoreStore.bookstores.length === 0) bookstoreStore.getBookstoresFromDb();
  },

  getTypesForFinance() {
    const cardStore = useCardsStore();
    if (cardStore.cards.length === 0) {
      cardStore.getCardsFromDb('ALL');
    }

    const firmStore = useFirmsStore();
    if (firmStore.firms.length === 0) {
      firmStore.getFirmsFromDb();
    }
  },
  displayAuthors(authors: Author[]) {
    return authors.map(author => author.lastName + ' ' + author.firstName).join(', ');
  },

  displayCategory(categories: Category[]) {
    return categories.map(category => category.name).join(', ');
  },

  findPatternInString(inputString: string, pattern: string, split: string) {
    // Dzielimy string na elementy według separatora ";;"
    const elements = inputString.split(split);

    // Filtrujemy elementy, które zawierają wzorzec (pattern)
    const matchedElements = elements.filter(element => element.includes(pattern));

    return matchedElements;
  },

  isLoanInstallment(installment: Installment): installment is LoanInstallment {
    return (installment as LoanInstallment).idLoan !== undefined;
  },

  isFeeInstallment(installment: Installment): installment is FeeInstallment {
    return (installment as FeeInstallment).idFee !== undefined;
  },

  getOwnershipStatusOption() {
    return Object.keys(OwnershipStatus)
      .filter(key => key !== 'ALL') // Usuwamy klucz ALL
      .map(key => ({
        label: TranslationService.translateEnum('OwnershipStatus', key), // klucz
        value: OwnershipStatus[key as keyof typeof OwnershipStatus], // wartość
      }));
  },
  getEditionTypeOption() {
    return Object.keys(EditionType)
      .filter(key => key !== 'ALL') // Usuwamy klucz ALL
      .map(key => ({
        label: TranslationService.translateEnum('EditionType', key), // klucz
        value: EditionType[key as keyof typeof EditionType], // wartość
      }));
  },
  getReadingStatusOption() {
    return Object.keys(ReadingStatus)
      .filter(key => key !== 'ALL') // Usuwamy klucz ALL
      .map(key => ({
        label: TranslationService.translateEnum('ReadingStatus', key), // klucz
        value: ReadingStatus[key as keyof typeof ReadingStatus], // wartość
      }));
  },
};
