import moment from 'moment';
import httpCommon from '@/config/http-common';
import type { Purchase } from '@/features/finance/purchases/types';
import type { PurchasePageParams } from '@/features/finance/_shared/queryKeys';
import { PaymentStatus } from '@/features/finance/payments/types';

export type PurchasesPageResult = {
  content: Purchase[];
  totalElements: number;
  number: number;
  totalPages: number;
};

function parsePurchase(p: Purchase | any): Purchase {
  return {
    ...p,
    purchaseDate: p.purchaseDate ? new Date(p.purchaseDate) : null,
    paymentDeadline: p.paymentDeadline ? new Date(p.paymentDeadline) : null,
    paymentDate: p.paymentDate ? new Date(p.paymentDate) : null,
  };
}

function toPurchasePayload(purchase: Purchase) {
  return {
    ...purchase,
    purchaseDate: purchase.purchaseDate ? moment(purchase.purchaseDate).format('YYYY-MM-DD') : null,
    paymentDeadline: purchase.paymentDeadline ? moment(purchase.paymentDeadline).format('YYYY-MM-DD') : null,
    paymentDate: purchase.paymentDate ? moment(purchase.paymentDate).format('YYYY-MM-DD') : null,
  };
}

function buildPurchaseSearchParams(params: PurchasePageParams): URLSearchParams {
  const search = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    sort: params.sort,
    direction: params.direction,
  });

  if (params.globalFilter) search.append('globalFilter', params.globalFilter);
  if (params.username) search.append('username', params.username);
  if (params.name) search.append('name', params.name);
  if (params.idFirm !== undefined && params.idFirm !== null) search.append('firmId', params.idFirm.toString());
  if (params.idCard !== undefined && params.idCard !== null) search.append('cardId', params.idCard.toString());
  if (params.purchaseDate) search.append('purchaseDate', params.purchaseDate);
  if (params.dateComparisonType) search.append('dateComparisonType', params.dateComparisonType);
  if (params.status) search.append('status', params.status);

  return search;
}

export async function fetchPurchasesPage(params: PurchasePageParams): Promise<PurchasesPageResult> {
  const search = buildPurchaseSearchParams(params);
  const response = await httpCommon.get(`/v1/finance/purchase/page?${search.toString()}`);

  return {
    content: (response.data.content ?? []).map(parsePurchase),
    totalElements: response.data.totalElements,
    number: response.data.number,
    totalPages: response.data.totalPages ?? 1,
  };
}

export async function fetchPurchase(purchaseId: number): Promise<Purchase | null> {
  const response = await httpCommon.get(`/v1/finance/purchase/${purchaseId}`);
  return response.data ? parsePurchase(response.data) : null;
}

export async function createPurchase(purchase: Purchase): Promise<Purchase> {
  const response = await httpCommon.post(`/v1/finance/purchase`, toPurchasePayload(purchase));
  return parsePurchase(response.data);
}

export async function updatePurchase(purchase: Purchase): Promise<Purchase> {
  const response = await httpCommon.put(`/v1/finance/purchase`, toPurchasePayload(purchase));
  return parsePurchase(response.data);
}

export async function deletePurchase(purchaseId: number): Promise<void> {
  await httpCommon.delete(`/v1/finance/purchase/${purchaseId}`);
}

export async function updatePurchaseStatus(purchaseId: number, status: PaymentStatus): Promise<void> {
  await httpCommon.put(`/v1/finance/purchase/status/${purchaseId}`, { value: status });
}

export async function fetchPurchasesCurrent(username: string): Promise<Map<string, Purchase[]>> {
  const response = await httpCommon.get(`/v1/finance/purchase/current/${username}`);
  const raw = (response.data ?? {}) as Record<string, unknown>;

  const map = new Map<string, Purchase[]>();
  for (const [deadline, purchases] of Object.entries(raw)) {
    map.set(deadline, (purchases as any[]).map(parsePurchase));
  }
  return map;
}

export async function fetchPurchasesSumToPay(): Promise<number> {
  const response = await httpCommon.get(`/v1/finance/purchase/sum/to-pay`);
  return Number(response.data);
}

export async function fetchPurchasesByYearAndUser(year: number, username?: string): Promise<Map<string, Purchase[]>> {
  if (!username) return new Map<string, Purchase[]>();

  const current = await fetchPurchasesCurrent(username);
  const purchasesMap = new Map<string, Purchase[]>();

  for (const [deadline, purchases] of current.entries()) {
    const filtered = purchases.filter(p => p.paymentDeadline && p.paymentDeadline.getFullYear() === year);
    if (filtered.length > 0) purchasesMap.set(deadline, filtered);
  }

  return purchasesMap;
}

export async function fetchPurchasesSumBetween(dateFrom: string, dateTo: string, userIds?: number[]): Promise<number> {
  let sum = 0;
  let page = 0;
  let totalPages = 1;
  const size = 200;

  while (page < totalPages) {
    const params: PurchasePageParams = {
      page,
      size,
      sort: 'purchaseDate',
      direction: 'ASC',
      purchaseDate: dateFrom,
      dateComparisonType: 'AFTER',
    };

    const result = await fetchPurchasesPage(params);

    for (const p of result.content) {
      if (!p.purchaseDate) continue;
      const d = moment(p.purchaseDate).format('YYYY-MM-DD');
      if (d < dateFrom || d > dateTo) continue;
      if (userIds && userIds.length > 0 && !userIds.includes(p.idUser)) continue;
      sum += Number(p.amount);
    }

    totalPages = result.totalPages ?? 1;
    page++;
  }

  return sum;
}
