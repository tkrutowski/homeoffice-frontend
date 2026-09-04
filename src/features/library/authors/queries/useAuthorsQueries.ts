import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchAuthors, fetchAuthorsPage, fetchAuthorStatistics } from '@/features/library/authors/api/authorsApi';
import { libraryKeys, type AuthorPageParams } from '@/features/library/_shared/queryKeys';

export function useAuthorsListQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: libraryKeys.authors.list(),
    queryFn: fetchAuthors,
    enabled: computed(() => toValue(enabled)),
  });
}

export function useAuthorsPageQuery(params: MaybeRefOrGetter<AuthorPageParams>) {
  return useQuery({
    queryKey: computed(() => libraryKeys.authors.page(toValue(params))),
    queryFn: () => fetchAuthorsPage(toValue(params)),
    refetchOnWindowFocus: false,
  });
}

export function useAuthorStatisticsQuery() {
  return useQuery({
    queryKey: libraryKeys.authors.statistics(),
    queryFn: fetchAuthorStatistics,
  });
}
