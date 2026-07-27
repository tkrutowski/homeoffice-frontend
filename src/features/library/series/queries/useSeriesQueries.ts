import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchSeries, fetchSeriesList } from '@/features/library/series/api/seriesApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { Series } from '@/features/library/series/types';

export function useSeriesListQuery() {
  return useQuery({
    queryKey: libraryKeys.series.list(),
    queryFn: fetchSeriesList,
  });
}

export function useSeriesQuery(seriesId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => libraryKeys.series.detail(toValue(seriesId))),
    queryFn: () => fetchSeries(toValue(seriesId)),
    enabled: computed(() => toValue(enabled) && toValue(seriesId) > 0),
  });
}

export function sortedSeries(series: Series[] | undefined): Series[] {
  return (series ?? [])
    .filter((serie: Series) => serie.id != 2)
    .sort((a: Series, b: Series) => a.title.localeCompare(b.title));
}

export function seriesWithNewBooks(series: Series[] | undefined): Series[] {
  return (series ?? [])
    .filter((serie: Series) => serie.hasNewBooks)
    .sort((a: Series, b: Series) => a.title.localeCompare(b.title));
}
