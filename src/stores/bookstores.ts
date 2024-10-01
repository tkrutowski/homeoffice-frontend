import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import { Bookstore } from "@/types/Book";

export const useBookstoreStore = defineStore("bookstore", {
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
    getBookstore(id: number): Bookstore | undefined {
      const bookstore = this.bookstores.find((bs) => bs.id === id);
      if (bookstore) return bookstore;
      else return undefined;
    },

    //------------------------------------------------------------DATABASE---------------------------------------------
    //
    //GET BOOKSTORES
    //
    async getBookstoresFromDb(): Promise<void> {
      console.log("START - getBookstoreFromDb()");
      this.loadingBookstore = true;

      try {
        const response = await httpCommon.get(`/v1/library/bookstore`);
        console.log("getBookstoreFromDb() - Ilosc[]: " + response.data.length);
        this.bookstores = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBookstoreFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingBookstore = false;
        console.log("END - getBookstoreFromDb()");
      }
    },
    //
    //GET  BOOKSTORE FROM DB BY ID
    //
    async getBookstoreFromDb(
      bookstoreId: number
    ): Promise<Bookstore | undefined> {
      console.log("START - getBookstoreFromDb(" + bookstoreId + ")");
      this.loadingBookstore = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/library/bookstore/` + bookstoreId,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBookstoreFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingBookstore = false;
        console.log("END - getBookstoreFromDb()");
      }
    },

    //
    //ADD BOOKSTORE
    //
    async addBookstoreDb(bookstore: Bookstore) {
      console.log("START - addBankDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(
          `/v1/library/bookstore`,
          bookstore,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        this.bookstores.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addBookstoreDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addBookstoreDb()");
      }
    },
    //
    //UPDATE BOOKSTORE
    //
    async updateBookstoreDb(bookstore: Bookstore) {
      console.log("START - updateBookstoreDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(
          `/v1/library/bookstore`,
          bookstore,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        const index = this.bookstores.findIndex((b) => b.id === bookstore.id);
        if (index !== -1) this.bookstores.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateBookstoreDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateBookstoreDb()");
      }
    },
    //
    //DELETE BOOKSTORE
    //
    async deleteBookstoreDb(bookstoreId: number) {
      console.log("START - deleteBookstoreDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        await httpCommon.delete(`/v1/library/bookstore/` + bookstoreId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.bookstores.findIndex((b) => b.id === bookstoreId);
        if (index !== -1) this.bookstores.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteBookstoreDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteBookstoreDb()");
      }
    },
  },
});
