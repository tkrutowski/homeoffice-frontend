import type { ActiveStatus } from '@/types/ActiveStatus';

export enum CardType {
  CREDIT = 'CREDIT',
  DEFERRED_PAYMENT = 'DEFERRED_PAYMENT',
}

export interface Card {
  id: number;
  idBank: number;
  idUser: number;
  name: string;
  activationDate: Date | null;
  limit: number;
  cardType: CardType;
  /** Wymagane tylko dla cardType === CREDIT. */
  closingDay?: number;
  /** Wymagane tylko dla cardType === CREDIT. */
  repaymentDay?: number;
  /** Wymagane tylko dla cardType === DEFERRED_PAYMENT. */
  paymentTermDays?: number;
  expirationDate: Date | null;
  otherInfo: string;
  activeStatus: ActiveStatus;
  cardNumber: string;
  imageUrl: string;
  multi: boolean;
}
