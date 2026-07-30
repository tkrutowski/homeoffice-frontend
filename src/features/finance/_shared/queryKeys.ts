import type { ActiveStatus } from '@/features/finance/cards/types';
import type { StatusType } from '@/types/StatusType';

export type LoanPageParams = {
  page: number;
  size: number;
  sort: string;
  direction: 'ASC' | 'DESC';
  globalFilter?: string | null;
  name?: string | null;
  idBank?: number | null;
  idUser?: number | null;
  date?: string | null;
  dateComparisonType?: string | null;
  amount?: number | null;
  amountComparisonType?: string | null;
  status?: string | null;
};

export type FeePageParams = {
  page: number;
  size: number;
  sort: string;
  direction: 'ASC' | 'DESC';
  globalFilter?: string | null;
  name?: string | null;
  idFirm?: number | null;
  idUser?: number | null;
  date?: string | null;
  dateComparisonType?: string | null;
  amount?: number | null;
  amountComparisonType?: string | null;
  status?: string | null;
};

export type PurchasePageParams = {
  page: number;
  size: number;
  sort: string;
  direction: 'ASC' | 'DESC';
  globalFilter?: string | null;
  username?: string | null;
  name?: string | null;
  idFirm?: number | null;
  idCard?: number | null;
  purchaseDate?: string | null;
  dateComparisonType?: string | null;
  status?: StatusType | null;
};

export const financeKeys = {
  all: ['finance'] as const,

  banks: {
    all: () => [...financeKeys.all, 'banks'] as const,
    list: () => [...financeKeys.banks.all(), 'list'] as const,
    detail: (id: number) => [...financeKeys.banks.all(), 'detail', id] as const,
  },

  cards: {
    all: () => [...financeKeys.all, 'cards'] as const,
    list: (status: ActiveStatus = 'ALL') => [...financeKeys.cards.all(), 'list', status] as const,
    byUser: (userId: number, status: ActiveStatus = 'ALL') =>
      [...financeKeys.cards.all(), 'by-user', userId, status] as const,
    detail: (id: number) => [...financeKeys.cards.all(), 'detail', id] as const,
  },

  loans: {
    all: () => [...financeKeys.all, 'loans'] as const,
    page: (params: LoanPageParams) => [...financeKeys.loans.all(), 'page', params] as const,
    detail: (id: number) => [...financeKeys.loans.all(), 'detail', id] as const,
    byYearStatusUser: (year: number, status: StatusType, userId?: number) =>
      [...financeKeys.loans.all(), 'by-year-status-user', year, status, userId ?? null] as const,
  },

  fees: {
    all: () => [...financeKeys.all, 'fees'] as const,
    page: (params: FeePageParams) => [...financeKeys.fees.all(), 'page', params] as const,
    detail: (id: number) => [...financeKeys.fees.all(), 'detail', id] as const,
    frequency: () => [...financeKeys.fees.all(), 'frequency'] as const,
    byYearStatusUser: (year: number, status: StatusType, userId?: number) =>
      [...financeKeys.fees.all(), 'by-year-status-user', year, status, userId ?? null] as const,
  },

  purchases: {
    all: () => [...financeKeys.all, 'purchases'] as const,
    page: (params: PurchasePageParams) => [...financeKeys.purchases.all(), 'page', params] as const,
    detail: (id: number) => [...financeKeys.purchases.all(), 'detail', id] as const,
    current: (username: string | null) => [...financeKeys.purchases.all(), 'current', username] as const,
    sumToPay: () => [...financeKeys.purchases.all(), 'sum-to-pay'] as const,
    byYearUser: (year: number, username?: string | null) =>
      [...financeKeys.purchases.all(), 'by-year-user', year, username ?? null] as const,
  },

  payments: {
    all: () => [...financeKeys.all, 'payments'] as const,
    byStatusYear: (status: string, year: number) =>
      [...financeKeys.payments.all(), 'by-status-year', status, year] as const,
  },

  transactions: {
    all: () => [...financeKeys.all, 'transactions'] as const,
    between: (dateFrom: string, dateTo: string) =>
      [...financeKeys.transactions.all(), 'between', dateFrom, dateTo] as const,
    categories: () => [...financeKeys.transactions.all(), 'categories'] as const,
    labels: () => [...financeKeys.transactions.all(), 'labels'] as const,
  },

  csvImport: {
    all: () => [...financeKeys.all, 'csv-import'] as const,
    job: (jobId: string) => [...financeKeys.csvImport.all(), 'job', jobId] as const,
  },

  home: {
    all: () => [...financeKeys.all, 'home'] as const,
  },
};
