import httpCommon from '@/config/http-common';
import type { Bookstore } from '@/features/library/bookstores/types';

export async function fetchBookstores(): Promise<Bookstore[]> {
  const response = await httpCommon.get(`/v1/library/bookstore`);
  return response.data ?? [];
}

export async function fetchBookstore(bookstoreId: number): Promise<Bookstore | undefined> {
  const response = await httpCommon.get(`/v1/library/bookstore/${bookstoreId}`);
  return response.data;
}

export async function createBookstore(bookstore: Bookstore): Promise<Bookstore> {
  const response = await httpCommon.post(`/v1/library/bookstore`, bookstore);
  return response.data;
}

export async function updateBookstore(bookstore: Bookstore): Promise<Bookstore> {
  const response = await httpCommon.put(`/v1/library/bookstore`, bookstore);
  return response.data;
}

export async function deleteBookstore(bookstoreId: number): Promise<void> {
  await httpCommon.delete(`/v1/library/bookstore/${bookstoreId}`);
}
