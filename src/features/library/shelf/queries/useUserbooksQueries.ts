import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  fetchBookStatistics,
  fetchBookstoreStatistics,
  fetchUserbook,
  fetchUserbooksByBookId,
  fetchUserbooksByStatus,
  fetchUserbooksByStatusAndYear,
  searchUserbooks,
} from '@/features/library/shelf/api/userbooksApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { ReadingStatus } from '@/features/library/shelf/types';

export function useUserbooksByStatusQuery(status: MaybeRefOrGetter<ReadingStatus>) {
  return useQuery({
    queryKey: computed(() => libraryKeys.shelf.byStatus(toValue(status))),
    queryFn: () => fetchUserbooksByStatus(toValue(status)),
  });
}

export function useUserbooksByStatusAndYearQuery(
  status: MaybeRefOrGetter<ReadingStatus>,
  year: MaybeRefOrGetter<number>
) {
  return useQuery({
    queryKey: computed(() => libraryKeys.shelf.byStatusAndYear(toValue(status), toValue(year))),
    queryFn: () => fetchUserbooksByStatusAndYear(toValue(status), toValue(year)),
  });
}

export function useUserbookQuery(userbookId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.shelf.detail(toValue(userbookId))),
    queryFn: () => fetchUserbook(toValue(userbookId)),
    enabled: computed(() => toValue(enabled) && toValue(userbookId) > 0),
  });
}

export function useUserbooksByBookIdQuery(bookId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.shelf.byBookId(toValue(bookId))),
    queryFn: () => fetchUserbooksByBookId(toValue(bookId)),
    enabled: computed(() => toValue(enabled) && toValue(bookId) > 0),
  });
}

export function useUserbooksSearchQuery(query: MaybeRefOrGetter<string>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.shelf.search(toValue(query))),
    queryFn: () => searchUserbooks(toValue(query)),
    enabled: computed(() => toValue(enabled) && toValue(query).trim().length > 0),
  });
}

export function useBookStatisticsQuery() {
  return useQuery({
    queryKey: libraryKeys.shelf.statistics(),
    queryFn: fetchBookStatistics,
  });
}

export function useBookstoreStatisticsQuery() {
  return useQuery({
    queryKey: libraryKeys.shelf.bookstoreStatistics(),
    queryFn: fetchBookstoreStatistics,
  });
}
