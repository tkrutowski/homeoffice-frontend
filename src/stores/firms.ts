import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import Firm from "@/assets/types/Firm";

export const useFirmsStore = defineStore("firm", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingFirms: false,

    firms: [] as Firm[],
  }),

  //getters = computed
  getters: {
    // getSortedInvoices: (state) =>
    //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
  },

  //actions = metody w komponentach
  actions: {
    //
    //GET FIRM BY ID
    //
    getFirm(id: number): Firm | undefined {
      // console.log("GET_FIRM id:", id);
      const result = this.firms.find((firm) => firm.id === id);
      // console.log("GET_FIRM bez:", result);
      if (result) return result;

      return undefined;
    },

    //----------------------------------DATABASE-----------------------
    //
    //GET FIRMS
    //
    async getFirmsFromDb(): Promise<void> {
      console.log("START - getFirmsFromDb()");
      this.loadingFirms = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        if (this.firms.length === 0) {
          const response = await httpCommon.get(`/finance/firm`, {
            headers: authorization.token !== "null" ? headers : {},
          });
          console.log("getFirmsFromDb() - Ilosc[]: " + response.data.length);
          this.firms = response.data;
        } else {
          console.log("getFirmsFromDb() - BEZ GET");
        }
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getFirmsFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingFirms = false;
        console.log("END - getFirmsFromDb()");
      }
    },
    //
    //GET  FIRM FROM DB BY ID
    //
    async getFirmFromDb(firmId: number): Promise<Firm | undefined> {
      console.log("START - getFirmFromDb(" + firmId + ")");
      this.loadingFirms = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.get(`/finance/firm/` + firmId, {
          headers: authorization.token !== "null" ? headers : {},
        });
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getFirmFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingFirms = false;
        console.log("END - getFirmFromDb()");
      }
    },
    //
    //ADD FIRM
    //
    async addFirmDb(firm: Firm) {
      console.log("START - addBankDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.post(`/finance/firm`, firm, {
          headers: authorization.token !== "null" ? headers : {},
        });
        this.firms.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addFirmDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addFirmDb()");
      }
    },
    //
    //UPDATE FIRM
    //
    async updateFirmDb(firm: Firm) {
      console.log("START - updateBankDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.put(`/finance/firm`, firm, {
          headers: authorization.token !== "null" ? headers : {},
        });
        const index = this.firms.findIndex((f) => f.id === firm.id);
        if (index !== -1) this.firms.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateFirmDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateFirmDb()");
      }
    },
    //
    //DELETE FIRM
    //
    async deleteFirmDb(firmId: number) {
      console.log("START - deleteFirmDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        await httpCommon.delete(`/finance/firm/` + firmId, {
          headers: authorization.token !== "null" ? headers : {},
        });
        const index = this.firms.findIndex((f) => f.id === firmId);
        if (index !== -1) this.firms.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteFirmDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteFirmDb()");
      }
    },
  },
});
