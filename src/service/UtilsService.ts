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
  formatCurrency(value: number | undefined) {
    // console.log("FORMAT_CURRENCY: ", value);
    if (value !== undefined && !Number.isNaN(value))
      return value.toLocaleString('pl-PL', {
        style: 'currency',
        currency: 'PLN',
      });
  },

  formatDateToString(value: Date | string | undefined): string {
    // console.log('formatDateToString', value);
    if (value) {
      const date = moment(value).format('YYYY-MM-DD');
      return date === '0001-01-01' ? '' : date;
    }
    return '';
  },

  formatDate(value: Date | string | undefined): Date | undefined {
    if (value) {
      const date = moment(value).format('YYYY-MM-DD');
      return date === '0001-01-01' ? undefined : new Date(date);
    }
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
