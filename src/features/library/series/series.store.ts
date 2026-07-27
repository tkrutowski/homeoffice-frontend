import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Series } from '@/features/library/series/types';
import type { Book } from '@/features/library/catalog/types';

export const useSeriesStore = defineStore('library-series', {
  state: () => ({
    loadingSeries: false,
    loadingBooksInSeries: false,
    series: [] as Series[],
  }),

  getters: {
    getSortedSeries: state =>
      state.series
        .filter((serie: Series) => serie.id != 2)
        .sort((a: Series, b: Series) => a.title.localeCompare(b.title)),

    getSeriesHasNewBooks: state =>
      state.series
        .filter((serie: Series) => serie.hasNewBooks)
        .sort((a: Series, b: Series) => a.title.localeCompare(b.title)),
  },

  actions: {
    async getSeriesFromDb(): Promise<void> {
      console.log('START - getSeriesFromDb()');
      this.loadingSeries = true;
      const response = await httpCommon.get(`/v1/library/series`);
      console.log('getSeriesFromDb() - Ilosc[]: ' + response.data.length);
      this.series = response.data;
      this.loadingSeries = false;
      console.log('END - getSeriesFromDb()');
    },

    async getSeriesByIdFromDb(id: number): Promise<Series | null> {
      console.log('START - getSeriesFromDb()');
      this.loadingSeries = true;
      const response = await httpCommon.get(`/v1/library/series/${id}`);
      console.log('getSeriesFromDb() - Ilosc[]: ' + response.data.length);
      this.loadingSeries = false;
      console.log('END - getSeriesFromDb()');
      if (response.data) return response.data;
      else return null;
    },

    async addSeriesDb(series: Series): Promise<Series> {
      console.log('START - addSeriesDb()');
      const response = await httpCommon.post(`/v1/library/series`, series);
      this.series.push(response.data);
      console.log('END - addSeriesDb()');
      return response.data;
    },

    async updateSeriesDb(series: Series) {
      console.log('START - updateSeriesDb()');
      const response = await httpCommon.put(`/v1/library/series`, series);

      const index = this.series.findIndex((s: Series) => s.id === series.id);
      if (index !== -1) this.series.splice(index, 1, response.data);
      console.log('END - updateSeriesDb()');
      return response.data;
    },

    async deleteSeriesDb(seriesId: number) {
      console.log('START - deleteSeriesDb()');
      await httpCommon.delete(`/v1/library/series/` + seriesId);
      const index = this.series.findIndex((s: Series) => s.id === seriesId);
      if (index !== -1) this.series.splice(index, 1);
      console.log('END - deleteSeriesDb()');
    },

    async filterSeries(filters: any) {
      console.log('filterSeries()', filters);
    },

    async getBooksInSeriesFromDb(seriesId: number): Promise<Book[]> {
      console.log('START - getBooksInSeriesFromDb(' + seriesId + ')');
      this.loadingBooksInSeries = true;

      const response = await httpCommon.get(`/v1/library/book/series/` + seriesId);
      console.log('getBooksInSeriesFromDb() - Ilosc[]: ' + response.data.length);
      this.loadingBooksInSeries = false;
      console.log('END - getBooksInSeriesFromDb()');
      return response.data;
    },

    async getNewBooksInSeriesFromDb(seriesId: number, url: string): Promise<Book[]> {
      console.log('START - getNewBooksInSeriesFromDb(' + seriesId + ')');
      this.loadingBooksInSeries = true;

      const response = await httpCommon.get(`/v1/library/book/series/new/${seriesId}?url=${url}`);
      console.log('getNewBooksInSeriesFromDb() - Ilosc[]: ' + response.data.length);
      this.loadingBooksInSeries = false;
      console.log('END - getNewBooksInSeriesFromDb()');
      return response.data;
    },
  },
});
