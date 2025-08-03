import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Bookstore } from '@/types/Book';

export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
    loginError: false,
    loadingBookstore: false,

    bookstores: [] as Bookstore[],
  }),

  //getters = computed
  getters: {
    // getSortedInvoices: (state) =>
    //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
  },

  //actions = metody w komponentach
  actions: {
    //
    //Get user by id
    //
    getBookstore(id: number): Bookstore | null {
      const bookstore = this.bookstores.find((bs: Bookstore) => bs.id === id);
      if (bookstore) return bookstore;
      else return null;
    },

    //------------------------------------------------------------DATABASE---------------------------------------------
    //
    //GET BOOKSTORES
    //
    async getBookstoresFromDb(): Promise<void> {
      console.log('START - getBookstoreFromDb()');
      this.loadingBookstore = true;

      const response = await httpCommon.get(`/v1/library/bookstore`);
      console.log('getBookstoreFromDb() - Ilosc[]: ' + response.data.length);
      this.bookstores = response.data;
      this.loadingBookstore = false;
      console.log('END - getBookstoreFromDb()');
    },
    //
    //GET  BOOKSTORE FROM DB BY ID
    //
    async getBookstoreFromDb(bookstoreId: number): Promise<Bookstore | undefined> {
      console.log('START - getBookstoreFromDb(' + bookstoreId + ')');
      this.loadingBookstore = true;

      const response = await httpCommon.get(`/v1/library/bookstore/` + bookstoreId);
      this.loadingBookstore = false;
      console.log('END - getBookstoreFromDb()');
      return response.data;
    },

    //
    //ADD BOOKSTORE
    //
    async addBookstoreDb(bookstore: Bookstore) {
      console.log('START - addBankDb()');
      const response = await httpCommon.post(`/v1/library/bookstore`, bookstore);
      this.bookstores.push(response.data);
      console.log('END - addBookstoreDb()');
    },
    //
    //UPDATE BOOKSTORE
    //
    async updateBookstoreDb(bookstore: Bookstore) {
      console.log('START - updateBookstoreDb()');

      const response = await httpCommon.put(`/v1/library/bookstore`, bookstore);
      const index = this.bookstores.findIndex((b: Bookstore) => b.id === bookstore.id);
      if (index !== -1) this.bookstores.splice(index, 1, response.data);
      console.log('END - updateBookstoreDb()');
    },
    //
    //DELETE BOOKSTORE
    //
    async deleteBookstoreDb(bookstoreId: number) {
      console.log('START - deleteBookstoreDb()');
      await httpCommon.delete(`/v1/library/bookstore/` + bookstoreId);
      const index = this.bookstores.findIndex((b: Bookstore) => b.id === bookstoreId);
      if (index !== -1) this.bookstores.splice(index, 1);
      console.log('END - deleteBookstoreDb()');
    },
  },
});
