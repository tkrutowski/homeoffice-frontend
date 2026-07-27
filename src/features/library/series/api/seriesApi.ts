import httpCommon from '@/config/http-common';
import type { Series } from '@/features/library/series/types';

export async function fetchSeriesList(): Promise<Series[]> {
  const response = await httpCommon.get(`/v1/library/series`);
  return response.data ?? [];
}

export async function fetchSeries(id: number): Promise<Series | null> {
  const response = await httpCommon.get(`/v1/library/series/${id}`);
  return response.data ?? null;
}

export async function createSeries(series: Series): Promise<Series> {
  const response = await httpCommon.post(`/v1/library/series`, series);
  return response.data;
}

export async function updateSeries(series: Series): Promise<Series> {
  const response = await httpCommon.put(`/v1/library/series`, series);
  return response.data;
}

export async function deleteSeries(seriesId: number): Promise<void> {
  await httpCommon.delete(`/v1/library/series/${seriesId}`);
}
