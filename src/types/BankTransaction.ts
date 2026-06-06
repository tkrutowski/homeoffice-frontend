export interface TransactionCategoryDto {
  id: number;
  name: string;
}

export interface TransactionLabelDto {
  id: number;
  name: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | string;

export interface BankTransaction {
  id: number;
  idFirm: number;
  idUser: number;
  purchaseIds: number[];
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
  description: string;
  transactionDate: string;
  amount: string;
  transactionCategory: TransactionCategoryDto;
  transactionLabel: TransactionLabelDto[];
}
