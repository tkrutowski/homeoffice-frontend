export type ActiveStatus = "ACTIVE" | "INACTIVE" | "ALL";

export interface Bank {
  id: number;
  name: string;
  city: string;
  street: string;
  zip: string;
  phone: string;
  phone2: string;
  fax: string;
  mail: string;
  www: string;
  otherInfo: string;
}
export interface Card {
  id: number;
  idBank: number;
  idUser: number;
  name: string;
  activationDate: Date | undefined;
  limit: number;
  repaymentDay: number;
  expirationDate: Date | undefined;
  otherInfo: string;
  activeStatus: ActiveStatus;
  cardNumber: string;
  closingDay: number;
  imageUrl: string;
}
