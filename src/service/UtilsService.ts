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
import { TransactionType, type TransactionCategoryType } from '@/types/BankTransaction';

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

  /**
   * `details` z API może być Mapą lub zwykłym obiektem po deserializacji JSON.
   * Zwraca pary [klucz, wartość]; brak pola → pusta tablica.
   */
  getDeviceDetailEntries(details: Map<string, string> | Record<string, string> | null | undefined): [string, string][] {
    if (details == null) return [];
    if (details instanceof Map) {
      return Array.from(details.entries());
    }
    if (typeof details === 'object') {
      return Object.entries(details);
    }
    return [];
  },

  /** Czy urządzenie ma jawne, puste `details` (Map lub `{}`). Brak pola w odpowiedzi → false. */
  hasEmptyDeviceDetails(details: Map<string, string> | Record<string, string> | null | undefined): boolean {
    if (details == null) return false;
    return UtilsService.getDeviceDetailEntries(details).length === 0;
  },

  formatTransactionCategoryType(type: TransactionCategoryType): string {
    switch (type) {
      case 'INCOME':
        return 'Przychód';
      case 'EXPENSE':
        return 'Wydatek';
      default:
        return type;
    }
  },

  formatTransactionType(type: TransactionType | string | null | undefined): string {
    if (!type) return '—';
    return TranslationService.translateEnum('TransactionType', type);
  },

  /** Przychód / wydatek na podstawie typu operacji bankowej (gdy brak kategorii). */
  inferCategoryTypeFromTransactionType(
    type: TransactionType | string | null | undefined
  ): TransactionCategoryType | null {
    switch (type) {
      case TransactionType.TRANSFER_IN:
      case TransactionType.DEPOSIT:
        return 'INCOME';
      case TransactionType.TRANSFER_OUT:
      case TransactionType.WITHDRAWAL:
      case TransactionType.CARD_PAYMENT:
      case TransactionType.LOAN_PAYMENT:
        return 'EXPENSE';
      default:
        return null;
    }
  },

  /** Slug ikony PrimeIcons → klasa CSS, np. "shopping-cart" → "pi pi-shopping-cart". */
  toPrimeIconClass(iconSlug: string | null | undefined): string | undefined {
    if (!iconSlug?.trim()) return undefined;
    const slug = iconSlug.trim();
    if (slug.startsWith('pi ')) return slug;
    if (slug.startsWith('pi-')) return `pi ${slug}`;
    return `pi pi-${slug}`;
  },

  /** Normalizacja koloru hex do #RRGGBB (uppercase). */
  normalizeHexColor(color: string | null | undefined): string | undefined {
    if (!color?.trim()) return undefined;
    let hex = color.trim();
    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return undefined;
    return hex.toUpperCase();
  },
};
