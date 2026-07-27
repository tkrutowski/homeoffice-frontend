import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import { getAudiobookAvailability as fetchAudiobookAvailability } from '@/features/library/shelf/AudiobookAvailabilityService';
import type { AudiobookAvailabilityResponse } from '@/features/library/shelf/types';
import type { Book, Category } from '@/features/library/catalog/types';

export const useBooksStore = defineStore('book', {
  state: () => ({
    btnDisabled: false,
    busyIcon: false,
    loadingBooks: false,
    searchBook: false,
    loadingCategories: false,
    rowsPerPage: parseInt(localStorage.getItem('rowsPerPageBooks') || '20', 10),
    tempBook: {} as Book,

    books: [] as Book[],
    totalBooks: 0,
    currentPage: 0,
    categories: [] as Category[],
    sortField: 'id',
    sortOrder: -1, // 1 = ASC, -1 = DESC - domyślnie sortujemy po ID malejąco
    filters: {} as any,
  }),

  getters: {},

  actions: {
    async refreshBooks() {
      await this.getBooksFromDb(this.currentPage, this.rowsPerPage);
    },
    async loadPage(page: number) {
      await this.getBooksFromDb(page, this.rowsPerPage);
    },
    async sortBooks(sortField: string, sortOrder: number) {
      console.log('sortBooks()', sortField, sortOrder);
      this.sortField = sortField;
      this.sortOrder = sortOrder;
      await this.loadPage(0);
    },
    async filterBooks(filters: any) {
      console.log('filterBooks()', filters);
      this.filters = filters;
      await this.loadPage(0);
    },
    async getBooks() {
      console.log('START - getBooks()');
      if (this.books.length === 0 && !this.loadingBooks) {
        await this.getBooksFromDb();
      }
      console.log('END - getBooks()');

      return this.books;
    },
    async getBooksFromDb(page: number = 0, size?: number): Promise<void> {
      const pageSize = size || this.rowsPerPage;
      console.log('START - getBooksFromDb()');
      this.loadingBooks = true;

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sort: this.sortField,
        direction: this.sortOrder > 0 ? 'ASC' : 'DESC',
      });

      if (this.filters.global?.value) {
        params.append('globalFilter', this.filters.global.value);
      }
      if (this.filters.title?.value) {
        params.append('title', this.filters.title.value);
      }
      if (this.filters.authors?.constraints?.[0]?.value) {
        params.append('author', this.filters.authors.constraints[0].value);
      }
      if (this.filters.categories?.value && this.filters.categories.value.length > 0) {
        params.append('category', this.filters.categories.value.join(','));
      }
      if (this.filters.series?.value && this.filters.series.value.length > 0) {
        params.append('series', this.filters.series.value.join(','));
      }

      const response = await httpCommon.get(`/v1/library/book/page?${params.toString()}`);
      console.log('getBooksFromDb() - Ilosc[]: ' + response.data.content.length);
      this.books = response.data.content;
      this.totalBooks = response.data.totalElements;
      this.currentPage = response.data.number;
      this.loadingBooks = false;
      console.log('END - getBooksFromDb()');
    },
    async getBookFromDb(bookId: number): Promise<Book | null> {
      console.log('START - getBookFromDb(' + bookId + ')');
      this.loadingBooks = true;

      const response = await httpCommon.get(`/v1/library/book/` + bookId);
      this.loadingBooks = false;
      console.log('END - getBookFromDb()');
      return response.data ? response.data : null;
    },
    async getAudiobookAvailability(bookId: number): Promise<AudiobookAvailabilityResponse | null> {
      return fetchAudiobookAvailability(bookId);
    },
    async getBookFromUrl(url: string, ai: boolean = false): Promise<Book | null> {
      console.log('START - getBookFromUrl(' + url + ')');
      this.searchBook = true;
      const baseUrl = ai
        ? `https://n8n.focikhome.synology.me/webhook/bf930829-7649-4dfe-a30d-56e941abedfa?&url=${url}`
        : `/v1/library/book/url?&url=${url}`;
      const response = await httpCommon.get(baseUrl, {
        timeout: 90000,
      });

      console.log('BOOK URL: ' + JSON.stringify(response.data));
      console.log('BOOK URL: ', response);
      this.searchBook = true;
      console.log('END - getBookFromUrl()');
      return response.data ? response.data : null;
    },
    async deleteBookDb(bookId: number) {
      console.log('START - deleteBookDb()');
      await httpCommon.delete(`/v1/library/book/` + bookId);
      const index = this.books.findIndex((b: Book) => b.id === bookId);
      if (index !== -1) this.books.splice(index, 1);
      console.log('END - deleteBookDb()');
    },
    async addBookDb(book: Book): Promise<Book> {
      console.log('START - addBookDb()');
      const response = await httpCommon.post(`/v1/library/book`, book);
      this.books.unshift(response.data);
      console.log('END - addBookDb()');
      return response.data;
    },
    async updateBookDb(book: Book) {
      console.log('START - updateBookDb()');

      const response = await httpCommon.put(`/v1/library/book`, book);
      const index = this.books.findIndex((b: Book) => b.id === book.id);
      if (index !== -1) this.books.splice(index, 1, response.data);
      console.log('END - updateBookDb()');
    },
    async getCategoriesFromDb(): Promise<void> {
      console.log('START - getCategoriesFromDb()');
      this.loadingCategories = true;

      const response = await httpCommon.get(`/v1/library/category`);
      console.log('getCategoriesFromDb() - Ilosc[]: ' + response.data.length);
      this.categories = response.data;
      this.loadingCategories = false;
      console.log('END - getCategoriesFromDb()');
    },
    async addCategoryDb(cat: Category) {
      console.log('START - addCategoryDb()');
      const response = await httpCommon.post(`/v1/library/category`, cat);
      this.categories.push(response.data);
      console.log('END - addCategoryDb()');
    },
  },
});
