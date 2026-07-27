import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createSeries, deleteSeries, updateSeries } from '@/features/library/series/api/seriesApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { Series } from '@/features/library/series/types';

export function useCreateSeriesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (series: Series) => createSeries(series),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.series.all() });
    },
  });
}

export function useUpdateSeriesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (series: Series) => updateSeries(series),
    onSuccess: series => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.series.all() });
      void queryClient.invalidateQueries({ queryKey: libraryKeys.series.detail(series.id) });
    },
  });
}

export function useDeleteSeriesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seriesId: number) => deleteSeries(seriesId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.series.all() });
      void queryClient.invalidateQueries({ queryKey: libraryKeys.books.all() });
    },
  });
}
