import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Author, Book, Category, Series } from '@/types/Book';

export const useBooksStore = defineStore('book', {
  state: () => ({
    btnDisabled: false,
    busyIcon: false,
    loadingBooks: false,
    loadingBooksInSeries: false,
    loadingAuthors: false,
    loadingSeries: false,
    loadingCategories: false,

    tempBook: {} as Book,

    books: [] as Book[],
    // booksInSeries: [] as Book[],
    authors: [] as Author[],
    series: [] as Series[],
    categories: [] as Category[],
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
      await this.getBooksFromDb();
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
    async getBooksFromDb(): Promise<void> {
      console.log('START - getBooksFromDb()');
      this.loadingBooks = true;

      const response = await httpCommon.get(`/v1/library/book`);
      console.log('getBooksFromDb() - Ilosc[]: ' + response.data.length);
      this.books = response.data;
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
      const baseUrl = ai
        ? `https://n8n.focikhome.synology.me/webhook/bf930829-7649-4dfe-a30d-56e941abedfa?&url=${url}`
        : `/v1/library/book/url?&url=${url}`;
      // console.log("BOOK URL: " + JSON.stringify(response.data));
      // const response = await httpCommon.get(`/v1/library/book/url?&url=${url}`)
      const response = await httpCommon.get(baseUrl);
      this.loadingBooks = false;
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
    async getAuthorsFromDb(): Promise<void> {
      console.log('START - getAuthorsFromDb()');
      this.loadingAuthors = true;

      const response = await httpCommon.get(`/v1/library/author`);
      console.log('getAuthorsFromDb() - Ilosc[]: ' + response.data.length);
      this.authors = response.data;
      this.loadingAuthors = false;
      console.log('END - getAuthorsFromDb()');
    },

    //ADD AUTHOR
    //
    async addAuthorDb(author: Author) {
      console.log('START - addAuthorDb()');
      const response = await httpCommon.post(`/v1/library/author`, author);
      this.authors.push(response.data);
      console.log('END - addAuthorDb()');
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
