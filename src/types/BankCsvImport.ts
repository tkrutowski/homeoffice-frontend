import type { TransactionCategoryDto, TransactionLabelDto, TransactionType } from '@/types/BankTransaction';

export interface AsyncTaskStartResponse {
  jobId: string;
}

export interface BankTransactionImportDto {
  idFirm: number;
  idUser: number;
  description: string;
  transactionDate: string;
  amount: string;
  transactionType: TransactionType;
  transactionLabel: TransactionLabelDto[];
  exists: boolean;
  balance: string;
}

export interface PurchaseImportDto {
  idCard: number;
  idFirm: number;
  idUser: number;
  name: string;
  purchaseDate: string;
  amount: string;
  otherInfo: string;
  exists: boolean;
}

export interface BankCsvImportResponse {
  totalProcessed: number;
  transactionCount: number;
  purchaseCount: number;
  duplicateCount: number;
  transactions: BankTransactionImportDto[];
  purchases: PurchaseImportDto[];
  errors: string[];
}

export interface BankTransactionImportRow extends BankTransactionImportDto {
  _rowKey: string;
  transactionCategory: TransactionCategoryDto | null;
}

export interface PurchaseImportRow extends PurchaseImportDto {
  _rowKey: string;
}

export type BankCsvImportStatus = 'idle' | 'uploading' | 'polling' | 'ready' | 'error';

export interface ImportSaveSummary {
  saved: number;
  failed: number;
  errors: string[];
}
