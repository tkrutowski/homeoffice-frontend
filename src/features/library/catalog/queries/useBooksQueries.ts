import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  fetchAudiobookAvailability,
  fetchBook,
  fetchBooksByAuthor,
  fetchBooksInSeries,
  fetchBooksPage,
  fetchCategories,
  fetchNewBooksInSeries,
} from '@/features/library/catalog/api/booksApi';
import { libraryKeys, type BookPageParams } from '@/features/library/_shared/queryKeys';
import type { AudiobookAvailabilityResponse } from '@/features/library/shelf/types';

export function useBooksPageQuery(params: MaybeRefOrGetter<BookPageParams>) {
  return useQuery({
    queryKey: computed(() => libraryKeys.books.page(toValue(params))),
    queryFn: () => fetchBooksPage(toValue(params)),
    refetchOnWindowFocus: false,
  });
}

export function useBookQuery(bookId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.books.detail(toValue(bookId))),
    queryFn: () => fetchBook(toValue(bookId)),
    enabled: computed(() => toValue(enabled) && toValue(bookId) > 0),
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: libraryKeys.categories.list(),
    queryFn: fetchCategories,
  });
}

export function useBooksByAuthorQuery(authorId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.books.byAuthor(toValue(authorId))),
    queryFn: () => fetchBooksByAuthor(toValue(authorId)),
    enabled: computed(() => toValue(enabled) && toValue(authorId) > 0),
  });
}

export function useBooksInSeriesQuery(seriesId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.books.bySeries(toValue(seriesId))),
    queryFn: () => fetchBooksInSeries(toValue(seriesId)),
    enabled: computed(() => toValue(enabled) && toValue(seriesId) > 0),
  });
}

export function useNewBooksInSeriesQuery(
  seriesId: MaybeRefOrGetter<number>,
  url: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  return useQuery({
    queryKey: computed(() => libraryKeys.books.newBySeries(toValue(seriesId), toValue(url))),
    queryFn: () => fetchNewBooksInSeries(toValue(seriesId), toValue(url)),
    enabled: computed(() => toValue(enabled) && toValue(seriesId) > 0 && toValue(url).length > 0),
  });
}

export function useAudiobookAvailabilityQuery(
  bookId: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean> = true,
  options?: Partial<UseQueryOptions<AudiobookAvailabilityResponse | null>>
) {
  return useQuery({
    queryKey: computed(() => libraryKeys.books.audiobookAvailability(toValue(bookId))),
    queryFn: () => fetchAudiobookAvailability(toValue(bookId)),
    enabled: computed(() => toValue(enabled) && toValue(bookId) > 0),
    ...options,
  });
}
