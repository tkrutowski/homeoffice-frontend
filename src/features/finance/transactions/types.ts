export type TransactionCategoryType = 'INCOME' | 'EXPENSE';

export interface TransactionCategoryDto {
  id: number;
  name: string;
  type: TransactionCategoryType;
  icon?: string | null;
  color?: string | null;
}

export interface TransactionCategoryCreatePayload {
  name: string;
  type: TransactionCategoryType;
  icon: string;
  color: string;
}

export interface TransactionLabelDto {
  id: number;
  name: string;
}

export enum TransactionType {
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  CARD_PAYMENT = 'CARD_PAYMENT',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
}

export interface BankTransaction {
  id: number;
  idFirm: number;
  idUser: number;
  purchaseId: number | null;
  description: string;
  transactionDate: string;
  amount: string;
  transactionType: TransactionType;
  transactionCategory: TransactionCategoryDto | null;
  transactionLabel: TransactionLabelDto[];
  boughtOnCredit: boolean;
}

export interface BankTransactionCreatePayload {
  id?: number;
  idFirm: number;
  idUser?: number;
  purchaseId?: number | null;
  description: string;
  transactionDate: string;
  amount: string;
  transactionCategory: TransactionCategoryDto;
  transactionLabel: TransactionLabelDto[];
}
