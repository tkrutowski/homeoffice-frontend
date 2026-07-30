import { defineStore } from 'pinia';
import type {
  BankCsvImportResponse,
  BankCsvImportStatus,
  BankTransactionImportRow,
  ImportSaveSummary,
  PurchaseImportRow,
} from '@/features/finance/transactions/csvImportTypes';
import type { BankTransactionCreatePayload } from '@/features/finance/transactions/types';
import type { Purchase } from '@/features/finance/purchases/types';
import { PaymentStatus } from '@/features/finance/payments/types';
import { createTransaction } from '@/features/finance/transactions/api/transactionsApi';
import { fetchCsvImportJob, startCsvImportJob } from '@/features/finance/transactions/api/csvImportApi';
import { fetchCards, findCardById } from '@/features/finance/cards/api/cardsApi';
import { createPurchase } from '@/features/finance/purchases/api/purchasesApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import { queryClient } from '@/config/queryClient';
import { UtilsService } from '@/service/UtilsService';
import moment from 'moment';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

function mapTransactionRows(transactions: BankCsvImportResponse['transactions']): BankTransactionImportRow[] {
  return (transactions ?? []).map((t, index) => ({
    ...t,
    _rowKey: `tx-${index}-${t.transactionDate}-${t.amount}-${t.description?.slice(0, 20) ?? ''}`,
    transactionCategory: null,
    transactionLabel: t.transactionLabel ?? [],
  }));
}

function mapPurchaseRows(purchases: BankCsvImportResponse['purchases']): PurchaseImportRow[] {
  return (purchases ?? []).map((p, index) => ({
    ...p,
    _rowKey: `pur-${index}-${p.purchaseDate}-${p.amount}-${p.name?.slice(0, 20) ?? ''}`,
  }));
}

export const useBankCsvImportStore = defineStore('bankCsvImport', {
  state: () => ({
    status: 'idle' as BankCsvImportStatus,
    jobId: null as string | null,
    importResult: null as BankCsvImportResponse | null,
    transactionRows: [] as BankTransactionImportRow[],
    purchaseRows: [] as PurchaseImportRow[],
    selectedTransactions: [] as BankTransactionImportRow[],
    selectedPurchases: [] as PurchaseImportRow[],
    reviewDialogVisible: false,
    errorMessage: null as string | null,
    savingTransactions: false,
    savingPurchases: false,
    lastTransactionSaveSummary: null as ImportSaveSummary | null,
    lastPurchaseSaveSummary: null as ImportSaveSummary | null,
    _pollTimer: null as ReturnType<typeof setTimeout> | null,
    _pollStartedAt: 0,
  }),

  getters: {
    isBusy: state => state.status === 'uploading' || state.status === 'polling',
    isReady: state => state.status === 'ready',
    hasAttention: state => state.status === 'ready',
  },

  actions: {
    openReviewDialog() {
      if (this.status === 'ready') {
        this.reviewDialogVisible = true;
      }
    },

    closeReviewDialog() {
      this.reviewDialogVisible = false;
    },

    clearImport() {
      if (this._pollTimer) {
        clearTimeout(this._pollTimer);
        this._pollTimer = null;
      }
      this.status = 'idle';
      this.jobId = null;
      this.importResult = null;
      this.transactionRows = [];
      this.purchaseRows = [];
      this.selectedTransactions = [];
      this.selectedPurchases = [];
      this.reviewDialogVisible = false;
      this.errorMessage = null;
      this.lastTransactionSaveSummary = null;
      this.lastPurchaseSaveSummary = null;
    },

    applyImportResult(result: BankCsvImportResponse) {
      this.importResult = result;
      this.transactionRows = mapTransactionRows(result.transactions);
      this.purchaseRows = mapPurchaseRows(result.purchases);
      this.selectedTransactions = [];
      this.selectedPurchases = [];
      this.status = 'ready';
    },

    async startImport(file: File) {
      if (this.isBusy) return;

      this.clearImport();
      this.status = 'uploading';

      try {
        const jobId = await startCsvImportJob(file);
        this.jobId = jobId;
        this.status = 'polling';
        this._pollStartedAt = Date.now();
        await this.pollUntilReady(jobId);
      } catch {
        this.status = 'error';
        this.errorMessage = 'Nie udało się wysłać pliku CSV.';
        throw new Error(this.errorMessage);
      }
    },

    async pollUntilReady(jobId: string): Promise<void> {
      if (Date.now() - this._pollStartedAt > POLL_TIMEOUT_MS) {
        this.status = 'error';
        this.errorMessage = 'Przekroczono czas oczekiwania na wynik importu.';
        throw new Error(this.errorMessage);
      }

      try {
        const result = await fetchCsvImportJob(jobId);

        if (result.status === 'pending') {
          await new Promise<void>(resolve => {
            this._pollTimer = setTimeout(() => {
              this._pollTimer = null;
              resolve();
            }, POLL_INTERVAL_MS);
          });
          return this.pollUntilReady(jobId);
        }

        this.applyImportResult(result.data);
        void queryClient.invalidateQueries({ queryKey: financeKeys.csvImport.all() });
      } catch {
        this.status = 'error';
        this.errorMessage = 'Błąd podczas pobierania wyniku importu.';
        throw new Error(this.errorMessage);
      }
    },

    async saveSelectedTransactions(): Promise<ImportSaveSummary> {
      const rows = this.selectedTransactions.filter(r => !r.exists);

      const summary: ImportSaveSummary = { saved: 0, failed: 0, errors: [] };

      if (rows.length === 0) {
        summary.errors.push('Nie zaznaczono żadnych transakcji do zapisu.');
        this.lastTransactionSaveSummary = summary;
        return summary;
      }

      const missingCategory = rows.filter(r => !r.transactionCategory || !r.idFirm);
      if (missingCategory.length > 0) {
        summary.errors.push(`Uzupełnij kategorię i firmę dla ${missingCategory.length} zaznaczonych transakcji.`);
        this.lastTransactionSaveSummary = summary;
        return summary;
      }

      this.savingTransactions = true;
      try {
        for (const row of rows) {
          const payload: BankTransactionCreatePayload = {
            idFirm: row.idFirm,
            idUser: row.idUser,
            description: row.description ?? '',
            transactionDate: moment(row.transactionDate).format('YYYY-MM-DD'),
            amount: String(row.amount),
            transactionCategory: row.transactionCategory!,
            transactionLabel: row.transactionLabel ?? [],
            purchaseId: null,
          };

          try {
            await createTransaction(payload);
            row.exists = true;
            summary.saved += 1;
            this.selectedTransactions = this.selectedTransactions.filter(r => r._rowKey !== row._rowKey);
          } catch (err) {
            summary.failed += 1;
            const msg = err instanceof Error ? err.message : 'Nieznany błąd';
            summary.errors.push(`${row.description || row.transactionDate}: ${msg}`);
          }
        }
      } finally {
        this.savingTransactions = false;
        this.lastTransactionSaveSummary = summary;
        void queryClient.invalidateQueries({ queryKey: financeKeys.transactions.all() });
      }

      return summary;
    },

    async saveSelectedPurchases(): Promise<ImportSaveSummary> {
      const rows = this.selectedPurchases.filter(r => !r.exists);

      const summary: ImportSaveSummary = { saved: 0, failed: 0, errors: [] };

      if (rows.length === 0) {
        summary.errors.push('Nie zaznaczono żadnych zakupów do zapisu.');
        this.lastPurchaseSaveSummary = summary;
        return summary;
      }

      const cards = await queryClient.ensureQueryData({
        queryKey: financeKeys.cards.list('ALL'),
        queryFn: () => fetchCards('ALL'),
      });

      this.savingPurchases = true;
      try {
        for (const row of rows) {
          const card = findCardById(cards, row.idCard);
          if (!card) {
            summary.failed += 1;
            summary.errors.push(`${row.name}: nie znaleziono karty (id ${row.idCard}).`);
            continue;
          }

          const purchaseDate = moment(row.purchaseDate).toDate();
          const purchase: Purchase = {
            id: 0,
            idCard: row.idCard,
            idFirm: row.idFirm,
            idUser: row.idUser,
            name: row.name,
            purchaseDate,
            amount: Number(row.amount),
            paymentDeadline: UtilsService.calculatePurchasePaymentDeadline(card, purchaseDate),
            paymentDate: null,
            paymentStatus: PaymentStatus.TO_PAY,
            installment: false,
            otherInfo: row.otherInfo ?? '',
          };

          try {
            await createPurchase(purchase);
            row.exists = true;
            summary.saved += 1;
            this.selectedPurchases = this.selectedPurchases.filter(r => r._rowKey !== row._rowKey);
          } catch (err) {
            summary.failed += 1;
            const msg = err instanceof Error ? err.message : 'Nieznany błąd';
            summary.errors.push(`${row.name}: ${msg}`);
          }
        }
      } finally {
        this.savingPurchases = false;
        this.lastPurchaseSaveSummary = summary;
        void queryClient.invalidateQueries({ queryKey: financeKeys.purchases.all() });
      }

      return summary;
    },
  },
});
