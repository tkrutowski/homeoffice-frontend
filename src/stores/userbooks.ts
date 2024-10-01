import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import {
  EditionType,
  OwnershipStatus,
  ReadingStatus,
  UserBook,
} from "@/types/Book";

export const useUserbooksStore = defineStore("userbook", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingUserbooks: false,
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
    getBooksReadNow: (state) => {
      return state.userbooks.filter(
        (ub) => ub.readingStatus.name === "READ_NOW"
      );
    },
    getBooksToRead: (state) => {
      return state.userbooks.filter(
        (ub) => ub.readingStatus.name === "NOT_READ"
      );
    },
  },

  //actions = metody w komponentach
  actions: {
    //
    //GET USERBOOKS
    //
    getUserbooksByDate(year: number) {
      return this.userbooks
        .filter((ub) => ub.readingStatus.name === "READ")
        .filter((ub) => ub.readTo.slice(0, 4) === year.toString());
    },
    async getUserbooksFromDb(): Promise<void> {
      console.log("START - getUserbooksFromDb()");
      this.loadingUserbooks = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(`/v1/library/userbook`, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        console.log("getUserbooksFromDb() - Ilosc[]: " + response.data.length);
        this.userbooks = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUserbooksFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingUserbooks = false;
        console.log("END - getUserbooksFromDb()");
      }
    },
    //
    //GET USERBOOKS BY STATUS
    //
    async getUserbooksByStatusFromDb(status: ReadingStatus): Promise<void> {
      console.log("START - getUserbooksFromDb()");
      this.loadingUserbooks = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/library/userbook/status?status=` + status.name,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        console.log("getBanksFromDb() - Ilosc[]: " + response.data.length);
        this.userbooks = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUserbooksFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingUserbooks = false;
        console.log("END - getUserbooksFromDb()");
      }
    },
    //
    //GET  USERBOOK FROM DB BY ID
    //
    async getUserbookFromDb(userbookId: number): Promise<UserBook | undefined> {
      console.log("START - getUserbookFromDb(" + userbookId + ")");
      this.loadingUserbooks = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/library/userbook/` + userbookId,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUserbookFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingUserbooks = false;
        console.log("END - getUserbookFromDb()");
      }
    },
    //
    //GET  USERBOOK FROM DB BY ID
    //
    async getUserbooksByBookIdFromDb(
      bookId: number
    ): Promise<UserBook[] | undefined> {
      console.log("START - getUserbookFromDb(" + bookId + ")");
      this.loadingUserbooks = true;
      try {
        const response = await httpCommon.get(
          `/v1/library/userbook/check?id=` + bookId);
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUserbooksByBookIdFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingUserbooks = false;
        console.log("END - getUserbooksByBookIdFromDb()");
      }
    },

    //
    //ADD USERBOOK
    //
    async addUserbookDb(userbook: UserBook) {
      console.log("START - addUserbookDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(
          `/v1/library/userbook`,
          userbook,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        this.userbooks.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addUserbookDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addUserbookDb()");
      }
    },
    //
    //UPDATE USERBOOK
    //
    async updateUserbookDb(userbook: UserBook) {
      console.log("START - updateUserbookDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(
          `/v1/library/userbook`,
          userbook,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        const index = this.userbooks.findIndex((ub) => ub.id === userbook.id);
        if (index !== -1) this.userbooks.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateUserbookDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateUserbookDb()");
      }
    },
    //
    //DELETE USERBOOK
    //
    async deleteUserbookDb(userbookId: number) {
      console.log("START - deleteUserbookDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        await httpCommon.delete(`/v1/library/userbook/` + userbookId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.userbooks.findIndex((b) => b.id === userbookId);
        if (index !== -1) this.userbooks.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteUserbookDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteUserbookDb()");
      }
    },

    //
    //GET OWNERSHIP  FROM DB
    //
    async getOwnershipFromDb(): Promise<void> {
      console.log("START - getOwnershipFromDb()");
      this.loadingOwnership = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/library/userbook/ownership_status`,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        this.ownershipStatus = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getOwnershipFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingOwnership = false;
        console.log("END - getOwnershipFromDb()");
      }
    },

    //
    //GET EDITION TYPE FROM DB
    //
    async getEditionTypeFromDb(): Promise<void> {
      console.log("START - getEditionTypeFromDb()");
      this.loadingEditionType = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/library/userbook/edition_type`,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        this.editionTypes = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getEditionTypeFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingEditionType = false;
        console.log("END - getEditionTypeFromDb()");
      }
    },

    //
    //GET READING STATUS FROM DB
    //
    async getReadingStatusFromDb(): Promise<void> {
      console.log("START - getReadingStatusFromDb()");
      this.loadingReadingStatus = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/library/userbook/reading_status`,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        this.readingStatuses = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getReadingStatusFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingReadingStatus = false;
        console.log("END - getReadingStatusFromDb()");
      }
    },
  },
});
