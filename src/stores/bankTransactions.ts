import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import moment from 'moment';
import type {
  BankTransaction,
  BankTransactionCreatePayload,
  TransactionCategoryCreatePayload,
  TransactionCategoryDto,
  TransactionLabelDto,
} from '@/types/BankTransaction';
import type { BalanceQueryParams, BalanceSeriesPoint, BalanceSeriesQueryParams } from '@/types/BankTransactionDashboard';

function sortCategories(categories: TransactionCategoryDto[]): TransactionCategoryDto[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

function resolveTransactionLabelName(
  item: TransactionLabelDto & { label?: string },
  catalog: TransactionLabelDto[]
): string {
  const direct = item.name?.trim() || item.label?.trim();
  if (direct) return direct;
  return catalog.find(l => l.id === item.id)?.name?.trim() ?? '';
}

function enrichTransactionLabels(
  raw: TransactionLabelDto[] | undefined,
  catalog: TransactionLabelDto[]
): TransactionLabelDto[] {
  if (!raw?.length) return [];
  return raw
    .map(item => {
      const name = resolveTransactionLabelName(item, catalog);
      return name ? { id: item.id, name } : null;
    })
    .filter((item): item is TransactionLabelDto => item !== null);
}

function enrichTransactions(
  transactions: BankTransaction[],
  categories: TransactionCategoryDto[],
  labels: TransactionLabelDto[] = []
): BankTransaction[] {
  return transactions.map(t => {
    let enriched = {
      ...t,
      transactionLabel: enrichTransactionLabels(t.transactionLabel, labels),
    };
    if (!t.transactionCategory) return enriched;
    const full = categories.find(c => c.id === t.transactionCategory!.id);
    if (!full) return enriched;
    return {
      ...enriched,
      transactionCategory: {
        ...full,
        type: t.transactionCategory.type ?? full.type,
      },
    };
  });
}

function groupByDate(transactions: BankTransaction[]): Map<string, BankTransaction[]> {
  const map = new Map<string, BankTransaction[]>();
  for (const t of transactions) {
    const key = t.transactionDate;
    const list = map.get(key);
    if (list) list.push(t);
    else map.set(key, [t]);
  }
  for (const [, list] of map.entries()) {
    list.sort((a, b) => b.id - a.id);
  }
  return map;
}

function toPayloadPayload(payload: BankTransactionCreatePayload) {
  console.log(payload);
  return {
    ...payload,
    transactionDate: moment(payload.transactionDate).format('YYYY-MM-DD'),
    transactionCategory: {
      id: payload.transactionCategory.id,
      name: payload.transactionCategory.name,
      type: payload.transactionCategory.type,
    },
    transactionLabel: payload.transactionLabel.map(l => ({ id: l.id, name: l.name })),
  };
}

export const useBankTransactionsStore = defineStore('bankTransactions', {
  state: () => ({
    loadingTransactions: false,
    loadingCategories: false,
    loadingLabels: false,
    transactionsByDate: new Map<string, BankTransaction[]>(),
    rawTransactions: [] as BankTransaction[],
    categories: [] as TransactionCategoryDto[],
    labels: [] as TransactionLabelDto[],
  }),

  actions: {
    clearTransactionsMap() {
      this.transactionsByDate = new Map();
      this.rawTransactions = [];
    },

    getTransactionsByDate(date: string) {
      return this.transactionsByDate.get(date);
    },

    getTransactionById(id: number): BankTransaction | null {
      for (const t of this.rawTransactions) {
        if (t.id === id) return t;
      }
      return null;
    },

    resolveTransactionCategory(category: TransactionCategoryDto | null | undefined): TransactionCategoryDto | null {
      if (!category) return null;
      const full = this.categories.find(c => c.id === category.id);
      if (!full) return category;
      return {
        ...full,
        type: category.type ?? full.type,
      };
    },

    resolveTransactionLabelName(label: TransactionLabelDto & { label?: string }): string {
      return resolveTransactionLabelName(label, this.labels);
    },

    async getCategoriesFromDb(): Promise<TransactionCategoryDto[]> {
      this.loadingCategories = true;
      try {
        const response = await httpCommon.get('/v1/finance/transaction-category');
        this.categories = sortCategories(response.data);
        if (this.rawTransactions.length > 0) {
          this.rawTransactions = enrichTransactions(this.rawTransactions, this.categories, this.labels);
          this.transactionsByDate = groupByDate(this.rawTransactions);
        }
        return this.categories;
      } finally {
        this.loadingCategories = false;
      }
    },

    async getLabelsFromDb(): Promise<TransactionLabelDto[]> {
      this.loadingLabels = true;
      try {
        const response = await httpCommon.get('/v1/finance/transaction-label');
        this.labels = response.data;
        return this.labels;
      } finally {
        this.loadingLabels = false;
      }
    },

    async addLabelDb(name: string): Promise<TransactionLabelDto> {
      const response = await httpCommon.post('/v1/finance/transaction-label', { name });
      const created: TransactionLabelDto = response.data;
      this.labels.push(created);
      return created;
    },

    async addCategoryDb(payload: TransactionCategoryCreatePayload): Promise<TransactionCategoryDto> {
      const response = await httpCommon.post('/v1/finance/transaction-category', {
        ...payload,
        color: payload.color.toUpperCase(),
      });
      const created: TransactionCategoryDto = response.data;
      this.categories = sortCategories([...this.categories, created]);
      return created;
    },

    async getTransactionsBetween(dateFrom: string, dateTo: string): Promise<Map<string, BankTransaction[]>> {
      this.loadingTransactions = true;
      try {
        const response = await httpCommon.get('/v1/finance/bank-transaction/between', {
          params: { dateFrom, dateTo },
        });
        this.rawTransactions = enrichTransactions(response.data, this.categories, this.labels);
        this.transactionsByDate = groupByDate(this.rawTransactions);
        return this.transactionsByDate;
      } finally {
        this.loadingTransactions = false;
      }
    },

    async addTransactionDb(payload: BankTransactionCreatePayload): Promise<BankTransaction> {
      const response = await httpCommon.post('/v1/finance/bank-transaction', toPayloadPayload(payload));
      const created: BankTransaction = enrichTransactions([response.data], this.categories, this.labels)[0];
      this.rawTransactions.push(created);
      const key = created.transactionDate;
      const list = this.transactionsByDate.get(key);
      if (list) list.unshift(created);
      else this.transactionsByDate.set(key, [created]);
      return created;
    },

    async updateTransactionDb(payload: BankTransactionCreatePayload & { id: number }): Promise<BankTransaction> {
      const response = await httpCommon.put('/v1/finance/bank-transaction', toPayloadPayload(payload));
      const updated: BankTransaction = enrichTransactions([response.data], this.categories, this.labels)[0];
      const idx = this.rawTransactions.findIndex(t => t.id === updated.id);
      if (idx !== -1) this.rawTransactions[idx] = updated;
      this.transactionsByDate = groupByDate(this.rawTransactions);
      return updated;
    },

    async deleteTransactionDb(id: number): Promise<void> {
      await httpCommon.delete(`/v1/finance/bank-transaction/${id}`);
      this.rawTransactions = this.rawTransactions.filter(t => t.id !== id);
      this.transactionsByDate = groupByDate(this.rawTransactions);
    },

    /** Stub – podmienić URL gdy backend będzie gotowy. */
    async getCurrentBalance(_params: BalanceQueryParams): Promise<number | null> {
      // const response = await httpCommon.get('/v1/finance/bank-transaction/balance/current', {
      //   params: buildBalanceQueryParams(params),
      // });
      // return Number(response.data.balance);
      return null;
    },

    /** Stub – podmienić URL gdy backend będzie gotowy. */
    async getBalanceSeries(_params: BalanceSeriesQueryParams): Promise<BalanceSeriesPoint[]> {
      // const response = await httpCommon.get('/v1/finance/bank-transaction/balance/series', {
      //   params: buildBalanceQueryParams(params),
      // });
      // return response.data;
      return [];
    },
  },
});
