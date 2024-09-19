import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import { Author, Book, Category, Series } from "@/types/Book";

export const useBooksStore = defineStore("book", {
  state: () => ({
    loginError: false,
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
    getSortedSeries: (state) =>
        state.series.filter(serie => serie.id != 2)
            .sort((a, b) => a.title.localeCompare(b.title)),

    getSeriesHasNewBooks: (state) =>
        state.series.filter(serie => serie.hasNewBooks)
            .sort((a, b) => a.title.localeCompare(b.title))
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
      console.log("START - getBooks()");
      if (this.books.length === 0 && !this.loadingBooks) {
        await this.getBooksFromDb();
      }
      console.log("END - getBooks()");

      return this.books;
    },
    //-------------------------------------------------------DATABASE
    //
    //GET BOOKS FROM DB
    //
    async getBooksFromDb(): Promise<void> {
      console.log("START - getBooksFromDb()");
      this.loadingBooks = true;

      // const authorization = useAuthorizationStore();
      // const headers = {
      //   Authorization: "Bearer " + authorization.accessToken,
      // };
      try {
        const response = await httpCommon.get(`/v1/library/book`);
        console.log("getBooksFromDb() - Ilosc[]: " + response.data.length);
        this.books = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBooksFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingBooks = false;
        console.log("END - getBooksFromDb()");
      }
    },
    //
    //GET  BOOK FROM DB BY ID
    //
    async getBookFromDb(bookId: number): Promise<Book | undefined> {
      console.log("START - getBookFromDb(" + bookId + ")");
      this.loadingBooks = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(`/v1/library/book/` + bookId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBookFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingBooks = false;
        console.log("END - getBookFromDb()");
      }
    },
    //
    //GET  BOOKS IN SERIES FROM DB BY ID
    //
    async getBooksInSeriesFromDb(seriesId: number): Promise<Book[]> {
      console.log("START - getBooksInSeriesFromDb(" + seriesId + ")");
      this.loadingBooksInSeries = true;

      try {
        const response = await httpCommon.get(
          `/v1/library/book/series/` + seriesId);
        console.log(
          "getBooksInSeriesFromDb() - Ilosc[]: " + response.data.length
        );
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBooksInSeriesFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return [];
      } finally {
        this.loadingBooksInSeries = false;
        console.log("END - getBooksInSeriesFromDb()");
      }
    },
    //
    //GET ALL BOOKS IN SERIES FROM DB BY ID
    //
    async getNewBooksInSeriesFromDb(seriesId: number, url:string): Promise<Book[]> {
      console.log("START - getNewBooksInSeriesFromDb(" + seriesId + ")");
      this.loadingBooksInSeries = true;

      try {
        const response = await httpCommon.get(
            `/v1/library/book/series/new/${seriesId}?url=${url}`);
        console.log(
            "getNewBooksInSeriesFromDb() - Ilosc[]: " + response.data.length
        );
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getNewBooksInSeriesFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return [];
      } finally {
        this.loadingBooksInSeries = false;
        console.log("END - getNewBooksInSeriesFromDb()");
      }
    },
    //
    //Get books from url
    async getBookFromUrl(url: string) {
      console.log("START - getBookFromUrl(" + url + ")");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/library/book/url?&url=` + url,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        console.log("BOOK URL: " + JSON.stringify(response.data));
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBookFromUrl(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingBooks = false;
        console.log("END - getBookFromUrl()");
      }
    },
    //
    //DELETE BOOK
    //
    async deleteBookDb(bookId: number) {
      console.log("START - deleteBookDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        await httpCommon.delete(`/v1/library/book/` + bookId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.books.findIndex((l) => l.id === bookId);
        if (index !== -1) this.books.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteBookDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteBookDb()");
      }
    },

    //ADD BOOK
    //
    async addBookDb(book: Book) {
      console.log("START - addBookDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(`/v1/library/book`, book, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        this.books.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addBookDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addBookDb()");
      }
    },

    //
    //UPDATE BOOK
    //
    async updateBookDb(book: Book) {
      console.log("START - updateBookDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(`/v1/library/book`, book, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.books.findIndex((b) => b.id === book.id);
        if (index !== -1) this.books.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateBookDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateBookDb()");
      }
    },

    //-------------------------------------------------------AUTHOR
    //
    //GET AUTHORS FROM DB
    //
    async getAuthorsFromDb(): Promise<void> {
      console.log("START - getAuthorsFromDb()");
      this.loadingAuthors = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(`/v1/library/author`, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        console.log("getAuthorsFromDb() - Ilosc[]: " + response.data.length);
        this.authors = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getAuthorsFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingAuthors = false;
        console.log("END - getAuthorsFromDb()");
      }
    },

    //ADD AUTHOR
    //
    async addAuthorDb(author: Author) {
      console.log("START - addAuthorDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(`/v1/library/author`, author, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        this.authors.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addAuthorDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addAuthorDb()");
      }
    },

    //-------------------------------------------------------SERIES
    //
    //GET SERIES FROM DB
    //
    async getSeriesFromDb(): Promise<void> {
      console.log("START - getSeriesFromDb()");
      this.loadingSeries = true;
      try {
        const response = await httpCommon.get(`/v1/library/series`);
        console.log("getSeriesFromDb() - Ilosc[]: " + response.data.length);
        this.series = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getSeriesFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingSeries = false;
        console.log("END - getSeriesFromDb()");
      }
    },
    //
    //GET SERIES FROM DB
    //
    async getSeriesByIdFromDb(id:number): Promise<Series> {
      console.log("START - getSeriesFromDb()");
      this.loadingSeries = true;
      try {
        const response = await httpCommon.get(`/v1/library/series/${id}`);
        console.log("getSeriesFromDb() - Ilosc[]: " + response.data.length);
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getSeriesFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingSeries = false;
        console.log("END - getSeriesFromDb()");
      }
    },
    //-------------------------------------------------------CATEGORY
    //
    //GET CATEGORIES FROM DB
    //
    async getCategoriesFromDb(): Promise<void> {
      console.log("START - getCategoriesFromDb()");
      this.loadingCategories = true;

      try {
        const response = await httpCommon.get(`/v1/library/category`);
        console.log("getCategoriesFromDb() - Ilosc[]: " + response.data.length);
        this.categories = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getCategoriesFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingCategories = false;
        console.log("END - getCategoriesFromDb()");
      }
    },

    //ADD CATEGORY
    //
    async addCategoryDb(cat: Category) {
      console.log("START - addCategoryDb()");
      try {
        const response = await httpCommon.post(`/v1/library/category`, cat);
        this.categories.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addCategoryDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        throw false;
      } finally {
        console.log("END - addCategoryDb()");
      }
    },
  },
});
