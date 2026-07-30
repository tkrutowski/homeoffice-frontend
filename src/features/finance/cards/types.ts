import type { ActiveStatus } from '@/types/ActiveStatus';

export interface Card {
  id: number;
  idBank: number;
  idUser: number;
  name: string;
  activationDate: Date | null;
  limit: number;
  repaymentDay: number;
  expirationDate: Date | null;
  otherInfo: string;
  activeStatus: ActiveStatus;
  cardNumber: string;
  closingDay: number;
  imageUrl: string;
  multi: boolean;
}
