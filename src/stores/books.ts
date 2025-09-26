import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Author, Book, Category, Series } from '@/types/Book';

export const useBooksStore = defineStore('book', {
  state: () => ({
    btnDisabled: false,
    busyIcon: false,
    loadingBooks: false,
    searchBook: false,
    loadingBooksInSeries: false,
    loadingAuthors: false,
    loadingSeries: false,
    loadingCategories: false,
    rowsPerPage: parseInt(localStorage.getItem('rowsPerPageBooks') || '20', 10),
    authorsRowsPerPage: parseInt(localStorage.getItem('rowsPerPageAuthors') || '20', 10),
    tempBook: {} as Book,

    books: [] as Book[],
    totalBooks: 0,
    currentPage: 0,
    // booksInSeries: [] as Book[],
    authors: [] as Author[],
    totalAuthors: 0,
    currentAuthorsPage: 0,
    series: [] as Series[],
    categories: [] as Category[],
    sortField: 'id',
    sortOrder: -1, // 1 = ASC, -1 = DESC - domyślnie sortujemy po ID malejąco
    filters: {} as any,
    authorFilters: {} as any,
  }),

  //getters = computed
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

  //actions = metody w komponentach
  actions: {
    //
    //REFRESH BOOKS
    //
    async refreshBooks() {
      await this.getBooksFromDb(this.currentPage, this.rowsPerPage);
    },
    //
    //LOAD PAGE
    //
    async loadPage(page: number) {
      await this.getBooksFromDb(page, this.rowsPerPage);
    },

    //
    //SORT BOOKS
    //
    async sortBooks(sortField: string, sortOrder: number) {
      console.log('sortBooks()', sortField, sortOrder);
      this.sortField = sortField;
      this.sortOrder = sortOrder;
      await this.loadPage(0); // Reset to first page after filter
    },

    //
    //FILTER BOOKS
    //
    async filterBooks(filters: any) {
      console.log('filterBooks()', filters);
      this.filters = filters;
      await this.loadPage(0); // Reset to first page after filter
    },
    //
    //GET BOOKS
    //
    async getBooks() {
      console.log('START - getBooks()');
      if (this.books.length === 0 && !this.loadingBooks) {
        await this.getBooksFromDb();
      }
      console.log('END - getBooks()');

      return this.books;
    },
    //-------------------------------------------------------DATABASE
    //
    //GET BOOKS FROM DB
    //
    async getBooksFromDb(page: number = 0, size?: number): Promise<void> {
      const pageSize = size || this.rowsPerPage;
      console.log('START - getBooksFromDb()');
      this.loadingBooks = true;

      // parameters
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sort: this.sortField,
        direction: this.sortOrder > 0 ? 'ASC' : 'DESC',
      });

      // filters
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
    //
    //GET  BOOK FROM DB BY ID
    //
    async getBookFromDb(bookId: number): Promise<Book | null> {
      console.log('START - getBookFromDb(' + bookId + ')');
      this.loadingBooks = true;

      const response = await httpCommon.get(`/v1/library/book/` + bookId);
      this.loadingBooks = false;
      console.log('END - getBookFromDb()');
      return response.data ? response.data : null;
    },
    //
    //GET  BOOKS IN SERIES FROM DB BY ID
    //
    async getBooksInSeriesFromDb(seriesId: number): Promise<Book[]> {
      console.log('START - getBooksInSeriesFromDb(' + seriesId + ')');
      this.loadingBooksInSeries = true;

      const response = await httpCommon.get(`/v1/library/book/series/` + seriesId);
      console.log('getBooksInSeriesFromDb() - Ilosc[]: ' + response.data.length);
      this.loadingBooksInSeries = false;
      console.log('END - getBooksInSeriesFromDb()');
      return response.data;
    },
    //
    //GET ALL BOOKS IN SERIES FROM DB BY ID
    //
    async getNewBooksInSeriesFromDb(seriesId: number, url: string): Promise<Book[]> {
      console.log('START - getNewBooksInSeriesFromDb(' + seriesId + ')');
      this.loadingBooksInSeries = true;

      const response = await httpCommon.get(`/v1/library/book/series/new/${seriesId}?url=${url}`);
      console.log('getNewBooksInSeriesFromDb() - Ilosc[]: ' + response.data.length);
      this.loadingBooksInSeries = false;
      console.log('END - getNewBooksInSeriesFromDb()');
      return response.data;
    },
    //
    //Get books from url
    async getBookFromUrl(url: string, ai: boolean = false): Promise<Book | null> {
      console.log('START - getBookFromUrl(' + url + ')');
      this.searchBook = true;
      const baseUrl = ai
        ? `https://n8n.focikhome.synology.me/webhook/bf930829-7649-4dfe-a30d-56e941abedfa?&url=${url}`
        : `/v1/library/book/url?&url=${url}`;
      // const response = await httpCommon.get(`/v1/library/book/url?&url=${url}`)
      const response = await httpCommon.get(baseUrl, {
        timeout: 90000, // timeout w milisekundach (np. 90 sekund)
      });

      console.log('BOOK URL: ' + JSON.stringify(response.data));
      console.log('BOOK URL: ', response);
      this.searchBook = true;
      console.log('END - getBookFromUrl()');
      return response.data ? response.data : null;
    },
    //
    //DELETE BOOK
    //
    async deleteBookDb(bookId: number) {
      console.log('START - deleteBookDb()');
      await httpCommon.delete(`/v1/library/book/` + bookId);
      const index = this.books.findIndex((b: Book) => b.id === bookId);
      if (index !== -1) this.books.splice(index, 1);
      console.log('END - deleteBookDb()');
    },

    //ADD BOOK
    //
    async addBookDb(book: Book) {
      console.log('START - addBookDb()');
      const response = await httpCommon.post(`/v1/library/book`, book);
      this.books.unshift(response.data);
      console.log('END - addBookDb()');
    },

    //
    //UPDATE BOOK
    //
    async updateBookDb(book: Book) {
      console.log('START - updateBookDb()');

      const response = await httpCommon.put(`/v1/library/book`, book);
      const index = this.books.findIndex((b: Book) => b.id === book.id);
      if (index !== -1) this.books.splice(index, 1, response.data);
      console.log('END - updateBookDb()');
    },

    //-------------------------------------------------------AUTHOR
    //
    //GET AUTHORS FROM DB
    //
    async getAuthorsFromDb(): Promise<Author[]> {
      console.log('START - getAuthorsFromDb()');
      const response = await httpCommon.get(`/v1/library/author`);
      console.log('getAuthorsFromDb() - Ilosc[]: ' + response.data.length);
      console.log('END - getAuthorsFromDb()');
      return response.data;
    },

    //
    //GET AUTHORS FROM DB WITH PAGINATION
    //
    async getAuthorsFromDbPage(page: number = 0, size?: number): Promise<void> {
      const pageSize = size || this.authorsRowsPerPage;
      console.log('START - getAuthorsFromDbPage()');
      this.loadingAuthors = true;

      // parameters
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sort: this.sortField,
        direction: this.sortOrder > 0 ? 'ASC' : 'DESC',
      });

      // filters
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

    //
    //LOAD AUTHORS PAGE
    //
    async loadAuthorsPage(page: number) {
      await this.getAuthorsFromDbPage(page, this.authorsRowsPerPage);
    },

    //
    //SORT AUTHORS
    //
    async sortAuthors(sortField: string, sortOrder: number) {
      console.log('sortAuthors()', sortField, sortOrder);
      this.sortField = sortField;
      this.sortOrder = sortOrder;
      await this.loadAuthorsPage(0); // Reset to first page after sort
    },

    //
    //FILTER AUTHORS
    //
    async filterAuthors(filters: any) {
      console.log('filterAuthors()', filters);
      this.authorFilters = filters;
      await this.loadAuthorsPage(0); // Reset to first page after filter
    },

    //GET AUTHOR BOOKS
    //
    async getAuthorBooks(authorId: number): Promise<Book[]> {
      console.log('START - getAuthorBooks()', authorId);
      this.loadingBooks = true;

      const response = await httpCommon.get(`/v1/library/book/author/${authorId}`);
      console.log('getAuthorBooks() - Ilosc[]: ' + response.data.length);
      this.loadingBooks = false;
      console.log('END - getAuthorBooks()');
      return response.data;
    },

    //ADD AUTHOR
    //
    async addAuthorDb(author: Author) {
      console.log('START - addAuthorDb()');
      const response = await httpCommon.post(`/v1/library/author`, author);
      this.authors.push(response.data);
      console.log('END - addAuthorDb()');
    },

    //
    //GET AUTHOR STATISTICS
    //
    async getAuthorStatistics(): Promise<Map<number, number>> {
      console.log('START - getAuthorStatistics()');
      this.loadingAuthors = true;

      const response = await httpCommon.get(`/v1/library/author/statistics`);
      console.log('getAuthorStatistics() - response:', response.data);
      this.loadingAuthors = false;

      // Konwertuj odpowiedź na Map<number, number>
      const authorStats: Map<number, number> = new Map();
      if (response.data) {
        // Sprawdzamy czy response.data to Map czy obiekt
        if (response.data instanceof Map) {
          // Jeśli to Map, iterujemy po entries
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
          // Jeśli to obiekt, używamy Object.entries
          Object.entries(response.data).forEach(([key, value]) => {
            console.log('Processing object entry - key:', key, 'value:', value);

            // Wyciągamy ID z stringa "AuthorDto(id=1, firstName=Jan, lastName=Kowalski)"
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

    //
    //DELETE AUTHOR
    //
    async deleteAuthorDb(authorId: number) {
      console.log('START - deleteAuthorDb()');
      await httpCommon.delete(`/v1/library/author/` + authorId);
      const index = this.authors.findIndex((a: Author) => a.id === authorId);
      if (index !== -1) this.authors.splice(index, 1);
      console.log('END - deleteAuthorDb()');
    },

    //
    //UPDATE AUTHOR
    //
    async updateAuthorDb(author: Author) {
      console.log('START - updateAuthorDb()');
      const response = await httpCommon.put(`/v1/library/author`, author);

      const index = this.authors.findIndex((a: Author) => a.id === author.id);
      if (index !== -1) this.authors.splice(index, 1, response.data);
      console.log('END - updateAuthorDb()');
      return response.data;
    },

    //-------------------------------------------------------SERIES
    //
    //GET SERIES FROM DB
    //
    async getSeriesFromDb(): Promise<void> {
      console.log('START - getSeriesFromDb()');
      this.loadingSeries = true;
      const response = await httpCommon.get(`/v1/library/series`);
      console.log('getSeriesFromDb() - Ilosc[]: ' + response.data.length);
      this.series = response.data;
      this.loadingSeries = false;
      console.log('END - getSeriesFromDb()');
    },
    //
    //GET SERIES FROM DB
    //
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

    //ADD SERIES
    //
    async addSeriesDb(series: Series) {
      console.log('START - addSeriesDb()');
      const response = await httpCommon.post(`/v1/library/series`, series);
      this.series.push(response.data);
      console.log('END - addSeriesDb()');
    },

    //
    //UPDATE SERIES
    //
    async updateSeriesDb(series: Series) {
      console.log('START - updateSeriesDb()');
      const response = await httpCommon.put(`/v1/library/series`, series);

      const index = this.series.findIndex((s: Series) => s.id === series.id);
      if (index !== -1) this.series.splice(index, 1, response.data);
      console.log('END - updateSeriesDb()');
      return response.data;
    },

    //-------------------------------------------------------CATEGORY
    //
    //GET CATEGORIES FROM DB
    //
    async getCategoriesFromDb(): Promise<void> {
      console.log('START - getCategoriesFromDb()');
      this.loadingCategories = true;

      const response = await httpCommon.get(`/v1/library/category`);
      console.log('getCategoriesFromDb() - Ilosc[]: ' + response.data.length);
      this.categories = response.data;
      this.loadingCategories = false;
      console.log('END - getCategoriesFromDb()');
    },

    //ADD CATEGORY
    //
    async addCategoryDb(cat: Category) {
      console.log('START - addCategoryDb()');
      const response = await httpCommon.post(`/v1/library/category`, cat);
      this.categories.push(response.data);
      console.log('END - addCategoryDb()');
    },
  },
});
