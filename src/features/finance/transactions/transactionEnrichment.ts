import type {
  BankTransaction,
  TransactionCategoryDto,
  TransactionLabelDto,
} from '@/features/finance/transactions/types';

export function sortCategories(categories: TransactionCategoryDto[]): TransactionCategoryDto[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

export function resolveTransactionLabelName(
  item: TransactionLabelDto & { label?: string },
  catalog: TransactionLabelDto[]
): string {
  const direct = item.name?.trim() || item.label?.trim();
  if (direct) return direct;
  return catalog.find(l => l.id === item.id)?.name?.trim() ?? '';
}

export function resolveTransactionCategory(
  category: TransactionCategoryDto | null | undefined,
  catalog: TransactionCategoryDto[]
): TransactionCategoryDto | null {
  if (!category) return null;
  const full = catalog.find(c => c.id === category.id);
  if (!full) return category;
  return {
    ...full,
    type: category.type ?? full.type,
  };
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

export function enrichTransactions(
  transactions: BankTransaction[],
  categories: TransactionCategoryDto[],
  labels: TransactionLabelDto[] = []
): BankTransaction[] {
  return transactions.map(t => {
    let enriched: BankTransaction = {
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

export function groupTransactionsByDate(transactions: BankTransaction[]): Map<string, BankTransaction[]> {
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
