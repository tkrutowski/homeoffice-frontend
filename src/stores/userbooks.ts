import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import { type BookStatistic, EditionType, OwnershipStatus, ReadingStatus, type UserBook } from '@/types/Book';
import moment from 'moment';

export const useUserbooksStore = defineStore('userbook', {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingUserbooks: false,
    loadingStatistics: false,
    loadingOwnership: false,
    loadingEditionType: false,
    loadingReadingStatus: false,
    readSelectedYear: new Date().getFullYear(),
    userbooks: [] as UserBook[],
    ownershipStatus: [] as OwnershipStatus[],
    editionTypes: [] as EditionType[],
    readingStatuses: [] as ReadingStatus[],
  }),

  //getters = computed
  getters: {
    // getSortedInvoices: (state) =>
    //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
    getBooksReadNow: state => {
      return state.userbooks.filter((ub: UserBook) => ub.readingStatus === 'READ_NOW');
    },
    getBooksToRead: state => {
      return state.userbooks.filter((ub: UserBook) => ub.readingStatus === 'NOT_READ');
    },
  },

  //actions = metody w komponentach
  actions: {
    //
    //GET USERBOOKS
    //
    async getUserbooksByDate(year: number, status: ReadingStatus): Promise<UserBook[]> {
      console.log('START - getUserbooksByDate()', year, status);
      this.loadingUserbooks = true;

      const response = await httpCommon.get(`/v1/library/userbook/status?status=${status}&year=${year}`);
      console.log('getUserbooksByDate() - Ilosc[]: ' + response.data.length);
      this.loadingUserbooks = false;
      console.log('END - getUserbooksByDate()');
      return response.data;
    },
    async getBooksReadNowByDate(year: number): Promise<UserBook[]> {
      return await this.getUserbooksByDate(year, ReadingStatus.READ_NOW);
    },
    async getBooksToReadByDate(year: number): Promise<UserBook[]> {
      return await this.getUserbooksByDate(year, ReadingStatus.NOT_READ);
    },
    async getUserbooksFromDb(): Promise<void> {
      console.log('START - getUserbooksFromDb()');
      this.loadingUserbooks = true;

      const response = await httpCommon.get(`/v1/library/userbook`);
      console.log('getUserbooksFromDb() - Ilosc[]: ' + response.data.length);
      this.userbooks = response.data;
      this.loadingUserbooks = false;
      console.log('END - getUserbooksFromDb()');
    },
    //
    //GET USERBOOKS BY STATUS
    //
    async getUserbooksByStatusFromDb(status: ReadingStatus): Promise<UserBook[]> {
      console.log('START - getUserbooksFromDb()');
      this.loadingUserbooks = true;

      const response = await httpCommon.get(`/v1/library/userbook/status?status=` + status);
      console.log('getBanksFromDb() - Ilosc[]: ' + response.data.length);
      this.loadingUserbooks = false;
      console.log('END - getUserbooksFromDb()');
      return response.data || [];
    },
    //
    //GET STATISTICS
    //
    async getStatisticsFromDb(): Promise<BookStatistic[]> {
      console.log('START - getStatisticsFromDb()');
      this.loadingStatistics = true;

      const response = await httpCommon.get(`/v1/library/userbook/statistics`);
      console.log('getStatisticsFromDb() - Ilosc[]: ' + response.data.length);
      this.loadingStatistics = false;
      console.log('END - getStatisticsFromDb()');
      return response.data || [];
    },
    //
    //GET BOOKSTORE STATISTICS
    //
    async getBookstoreStatisticsFromDb(): Promise<Map<string, number>> {
      console.log('START - getBookstoreStatisticsFromDb()');
      this.loadingStatistics = true;

      const response = await httpCommon.get(`/v1/library/userbook/statistics/bookstore`);
      // console.log('getBookstoreStatisticsFromDb() - response:', response.data);
      // console.log('getBookstoreStatisticsFromDb() - response type:', typeof response.data);
      // console.log('getBookstoreStatisticsFromDb() - response keys:', Object.keys(response.data || {}));
      this.loadingStatistics = false;

      
      // Konwertuj Map z backendu na obiekt z nazwami księgarni
      const bookstoreStats: Map<string, number> = new Map();
      if (response.data) {
        // console.log('Response data structure:', response.data);
        // console.log('Response data constructor:', response.data.constructor.name);
        
        // Sprawdzamy czy response.data to Map czy obiekt
        if (response.data instanceof Map) {
          // Jeśli to Map, iterujemy po entries
          response.data.forEach((value, key) => {
            console.log('Processing Map entry - key:', key, 'type:', typeof key, 'value:', value);
            if (typeof key === 'object' && key && 'name' in key) {
              console.log('Key is object with name:', (key as { name: string }).name);
              bookstoreStats.set((key as { name: string }).name, value as number);
            } else {
              console.log('Using key as name:', String(key));
              bookstoreStats.set(String(key), value as number);
            }
          });
        } else {
          // Jeśli to obiekt, używamy Object.entries
          Object.entries(response.data).forEach(([key, value]) => {
            console.log('Processing object entry - key:', key, 'value:', value);

            // Wyciągamy nazwę z stringa "BookstoreDto(id=1, name=Empik, url=...)"
            const nameMatch = key.match(/name=([^,]+)/);
            if (nameMatch) {
              const name = nameMatch[1];
              console.log('Extracted name from BookstoreDto string:', name);
              bookstoreStats.set(name, value as number);
            } else {
              console.log('Could not extract name from BookstoreDto string, using key:', key);
              bookstoreStats.set(key, value as number);
            }
          });
        }
      }
      console.log('END - getBookstoreStatisticsFromDb()');
      return bookstoreStats;
    },
    //
    //GET  USERBOOK FROM DB BY ID
    //
    async getUserbookFromDb(userbookId: number): Promise<UserBook | null> {
      console.log('START - getUserbookFromDb(' + userbookId + ')');
      this.loadingUserbooks = true;

      const response = await httpCommon.get(`/v1/library/userbook/` + userbookId);
      this.loadingUserbooks = false;
      console.log('END - getUserbookFromDb()');
      if (response.data) return response.data;
      else return null;
    },
    //
    //GET  USERBOOK FROM DB BY ID
    //
    async getUserbooksByBookIdFromDb(bookId: number): Promise<UserBook[] | null> {
      console.log('START - getUserbookFromDb(' + bookId + ')');
      this.loadingUserbooks = true;
      const response = await httpCommon.get(`/v1/library/userbook/check?id=` + bookId);
      this.loadingUserbooks = false;
      console.log('END - getUserbooksByBookIdFromDb()');
      return response.data ? response.data : null;
    },

    //
    //ADD USERBOOK
    //
    async addUserbookDb(userbook: UserBook) {
      console.log('START - addUserbookDb()');
      const transformedUserBook = {
        ...userbook,
        readFrom: userbook.readFrom ? moment(userbook.readFrom).format('YYYY-MM-DD') : null,
        readTo: userbook.readTo ? moment(userbook.readTo).format('YYYY-MM-DD') : null,
      };
      const response = await httpCommon.post(`/v1/library/userbook`, transformedUserBook);
      this.userbooks.push(response.data);
      console.log('END - addUserbookDb()');
    },
    //
    //UPDATE USERBOOK
    //
    async updateUserbookDb(userbook: UserBook) {
      console.log('START - updateUserbookDb()');
      const transformedUserBook = {
        ...userbook,
        readFrom: userbook.readFrom ? moment(userbook.readFrom).format('YYYY-MM-DD') : null,
        readTo: userbook.readTo ? moment(userbook.readTo).format('YYYY-MM-DD') : null,
      };
      const response = await httpCommon.put(`/v1/library/userbook`, transformedUserBook);
      const index = this.userbooks.findIndex((ub: UserBook) => ub.id === userbook.id);
      console.log('index', index);
      if (index !== -1) Object.assign(this.userbooks[index], response.data); //aktualizuje po zmiananch
      // if (index !== -1) this.userbooks.splice(index, 1, response.data)
      console.log('END - updateUserbookDb()');
    },
    //
    //DELETE USERBOOK
    //
    async deleteUserbookDb(userbookId: number) {
      console.log('START - deleteUserbookDb()');
      await httpCommon.delete(`/v1/library/userbook/` + userbookId);
      const index = this.userbooks.findIndex((b: UserBook) => b.id === userbookId);
      if (index !== -1) this.userbooks.splice(index, 1);
      console.log('END - deleteUserbookDb()');
    },
    //
    //SEARCH USERBOOKS
    //
    async searchUserbooksFromDb(query: string): Promise<void> {
      console.log('START - searchUserbooksFromDb()');
      this.loadingUserbooks = true;

      const response = await httpCommon.get(`/v1/library/userbook/search?query=${encodeURIComponent(query)}`);
      console.log('searchUserbooksFromDb() - Ilosc[]: ' + response.data.length);
      this.userbooks = response.data;
      this.loadingUserbooks = false;
      console.log('END - searchUserbooksFromDb()');
    },
  },
});
