import httpCommon from '@/config/http-common';
import type { BookStatistic, ReadingStatus, UserBook } from '@/features/library/shelf/types';
import { UtilsService } from '@/service/UtilsService';
import moment from 'moment';

function transformUserBookDates(userbook: UserBook) {
  return {
    ...userbook,
    readFrom: userbook.readFrom ? moment(userbook.readFrom).format('YYYY-MM-DD') : null,
    readTo: userbook.readTo ? moment(userbook.readTo).format('YYYY-MM-DD') : null,
  };
}

function parseUserBookDates(userbook: UserBook): UserBook {
  return {
    ...userbook,
    readFrom: userbook.readFrom ? (UtilsService.formatDate(userbook.readFrom) ?? null) : null,
    readTo: userbook.readTo ? (UtilsService.formatDate(userbook.readTo) ?? null) : null,
  };
}

function parseUserBooks(userbooks: UserBook[]): UserBook[] {
  return userbooks.map(parseUserBookDates);
}

export async function fetchUserbooksByStatus(status: ReadingStatus): Promise<UserBook[]> {
  const response = await httpCommon.get(`/v1/library/userbook/status?status=${status}`);
  return parseUserBooks(response.data ?? []);
}

export async function fetchUserbooksByStatusAndYear(status: ReadingStatus, year: number): Promise<UserBook[]> {
  const response = await httpCommon.get(`/v1/library/userbook/status?status=${status}&year=${year}`);
  return parseUserBooks(response.data ?? []);
}

export async function fetchUserbook(userbookId: number): Promise<UserBook | null> {
  const response = await httpCommon.get(`/v1/library/userbook/${userbookId}`);
  return response.data ? parseUserBookDates(response.data) : null;
}

export async function fetchUserbooksByBookId(bookId: number): Promise<UserBook[] | null> {
  const response = await httpCommon.get(`/v1/library/userbook/check?id=${bookId}`);
  return response.data ? parseUserBooks(response.data) : null;
}

export async function searchUserbooks(query: string): Promise<UserBook[]> {
  const response = await httpCommon.get(`/v1/library/userbook/search?query=${encodeURIComponent(query)}`);
  return parseUserBooks(response.data ?? []);
}

export async function fetchBookStatistics(): Promise<BookStatistic[]> {
  const response = await httpCommon.get(`/v1/library/userbook/statistics`);
  return response.data ?? [];
}

export async function fetchBookstoreStatistics(): Promise<Map<string, number>> {
  const response = await httpCommon.get(`/v1/library/userbook/statistics/bookstore`);
  const bookstoreStats = new Map<string, number>();

  if (!response.data) return bookstoreStats;

  if (response.data instanceof Map) {
    response.data.forEach((value: number, key: unknown) => {
      if (typeof key === 'object' && key && 'name' in key) {
        bookstoreStats.set((key as { name: string }).name, value);
      } else {
        bookstoreStats.set(String(key), value);
      }
    });
  } else {
    Object.entries(response.data).forEach(([key, value]) => {
      const nameMatch = key.match(/name=([^,]+)/);
      if (nameMatch) {
        bookstoreStats.set(nameMatch[1], value as number);
      } else {
        bookstoreStats.set(key, value as number);
      }
    });
  }

  return bookstoreStats;
}

export async function createUserbook(userbook: UserBook): Promise<void> {
  await httpCommon.post(`/v1/library/userbook`, transformUserBookDates(userbook));
}

export async function updateUserbook(userbook: UserBook): Promise<void> {
  await httpCommon.put(`/v1/library/userbook`, transformUserBookDates(userbook));
}

export async function deleteUserbook(userbookId: number): Promise<void> {
  await httpCommon.delete(`/v1/library/userbook/${userbookId}`);
}
