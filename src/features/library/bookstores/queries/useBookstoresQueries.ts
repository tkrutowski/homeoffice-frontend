import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchBookstore, fetchBookstores } from '@/features/library/bookstores/api/bookstoresApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { Bookstore } from '@/features/library/bookstores/types';

export function useBookstoresQuery() {
  return useQuery({
    queryKey: libraryKeys.bookstores.list(),
    queryFn: fetchBookstores,
  });
}

export function useBookstoreQuery(bookstoreId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.bookstores.detail(toValue(bookstoreId))),
    queryFn: () => fetchBookstore(toValue(bookstoreId)),
    enabled: computed(() => toValue(enabled) && toValue(bookstoreId) > 0),
  });
}

export function findBookstore(bookstores: Bookstore[] | undefined, id: number): Bookstore | null {
  return bookstores?.find(bs => bs.id === id) ?? null;
}
