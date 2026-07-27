import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Author } from '@/features/library/authors/types';
import type { Book } from '@/features/library/catalog/types';

export const useAuthorsStore = defineStore('library-authors', {
  state: () => ({
    loadingAuthors: false,
    loadingAuthorBooks: false,
    authorsRowsPerPage: parseInt(localStorage.getItem('rowsPerPageAuthors') || '20', 10),
    authors: [] as Author[],
    totalAuthors: 0,
    currentAuthorsPage: 0,
    sortField: 'id',
    sortOrder: -1,
    authorFilters: {} as any,
  }),

  getters: {},

  actions: {
    async getAuthorsFromDb(): Promise<Author[]> {
      console.log('START - getAuthorsFromDb()');
      const response = await httpCommon.get(`/v1/library/author`);
      console.log('getAuthorsFromDb() - Ilosc[]: ' + response.data.length);
      console.log('END - getAuthorsFromDb()');
      return response.data;
    },

    async getAuthorsFromDbPage(page: number = 0, size?: number): Promise<void> {
      const pageSize = size || this.authorsRowsPerPage;
      console.log('START - getAuthorsFromDbPage()');
      this.loadingAuthors = true;

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sort: this.sortField,
        direction: this.sortOrder > 0 ? 'ASC' : 'DESC',
      });

      if (this.authorFilters.global?.value) {
        params.append('globalFilter', this.authorFilters.global.value);
      }

      const response = await httpCommon.get(`/v1/library/author/page?${params.toString()}`);
      console.log('getAuthorsFromDbPage() - Ilosc[]: ' + response.data.content.length);
      this.authors = response.data.content;
      this.totalAuthors = response.data.totalElements;
      this.currentAuthorsPage = response.data.number;
      this.loadingAuthors = false;
      console.log('END - getAuthorsFromDbPage()');
    },

    async loadAuthorsPage(page: number) {
      await this.getAuthorsFromDbPage(page, this.authorsRowsPerPage);
    },

    async sortAuthors(sortField: string, sortOrder: number) {
      console.log('sortAuthors()', sortField, sortOrder);
      this.sortField = sortField;
      this.sortOrder = sortOrder;
      await this.loadAuthorsPage(0);
    },

    async filterAuthors(filters: any) {
      console.log('filterAuthors()', filters);
      this.authorFilters = filters;
      await this.loadAuthorsPage(0);
    },

    async getAuthorBooks(authorId: number): Promise<Book[]> {
      console.log('START - getAuthorBooks()', authorId);
      this.loadingAuthorBooks = true;

      const response = await httpCommon.get(`/v1/library/book/author/${authorId}`);
      console.log('getAuthorBooks() - Ilosc[]: ' + response.data.length);
      this.loadingAuthorBooks = false;
      console.log('END - getAuthorBooks()');
      return response.data;
    },

    async addAuthorDb(author: Author): Promise<Author> {
      console.log('START - addAuthorDb()');
      const response = await httpCommon.post(`/v1/library/author`, author);
      this.authors.push(response.data);
      console.log('END - addAuthorDb()');
      return response.data;
    },

    async getAuthorStatistics(): Promise<Map<number, number>> {
      console.log('START - getAuthorStatistics()');
      this.loadingAuthors = true;

      const response = await httpCommon.get(`/v1/library/author/statistics`);
      console.log('getAuthorStatistics() - response:', response.data);
      this.loadingAuthors = false;

      const authorStats: Map<number, number> = new Map();
      if (response.data) {
        if (response.data instanceof Map) {
          response.data.forEach((value, key) => {
            console.log('Processing Map entry - key:', key, 'type:', typeof key, 'value:', value);
            if (typeof key === 'object' && key && 'id' in key) {
              console.log('Key is object with id:', (key as { id: number }).id);
              authorStats.set((key as { id: number }).id, value as number);
            } else {
              console.log('Using key as id:', Number(key));
              authorStats.set(Number(key), value as number);
            }
          });
        } else {
          Object.entries(response.data).forEach(([key, value]) => {
            console.log('Processing object entry - key:', key, 'value:', value);

            const idMatch = key.match(/id=(\d+)/);
            if (idMatch) {
              const id = Number(idMatch[1]);
              console.log('Extracted id from AuthorDto string:', id);
              authorStats.set(id, value as number);
            } else {
              console.log('Could not extract id from AuthorDto string, using key:', key);
              authorStats.set(Number(key), value as number);
            }
          });
        }
      }
      console.log('END - getAuthorStatistics()');
      return authorStats;
    },

    async deleteAuthorDb(authorId: number) {
      console.log('START - deleteAuthorDb()');
      await httpCommon.delete(`/v1/library/author/` + authorId);
      const index = this.authors.findIndex((a: Author) => a.id === authorId);
      if (index !== -1) this.authors.splice(index, 1);
      console.log('END - deleteAuthorDb()');
    },

    async updateAuthorDb(author: Author) {
      console.log('START - updateAuthorDb()');
      const response = await httpCommon.put(`/v1/library/author`, author);

      const index = this.authors.findIndex((a: Author) => a.id === author.id);
      if (index !== -1) this.authors.splice(index, 1, response.data);
      console.log('END - updateAuthorDb()');
      return response.data;
    },
  },
});
