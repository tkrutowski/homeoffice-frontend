import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import { Bank } from "@/types/Bank";

export const useBanksStore = defineStore("bank", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingBanks: false,

    banks: [] as Bank[],
  }),

  //getters = computed
  getters: {
    // getSortedInvoices: (state) =>
    //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
  },

  //actions = metody w komponentach
  actions: {
    //
    //GET BANKS
    //
    async getBanksFromDb(): Promise<void> {
      console.log("START - getBanksFromDb()");
      this.loadingBanks = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        if (this.banks.length === 0) {
          const response = await httpCommon.get(`/v1/finance/bank`, {
            headers: authorization.accessToken !== "null" ? headers : {},
          });
          console.log("getBanksFromDb() - Ilosc[]: " + response.data.length);
          this.banks = response.data;
        } else {
          console.log("getBanksFromDb() - BEZ GET");
        }
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBanksFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingBanks = false;
        console.log("END - getBanksFromDb()");
      }
    },
    //
    //GET  BANK FROM DB BY ID
    //
    async getBankFromDb(bankId: number): Promise<Bank | undefined> {
      console.log("START - getBankFromDb(" + bankId + ")");
      this.loadingBanks = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(`/v1/finance/bank/` + bankId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBankFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingBanks = false;
        console.log("END - getBanksFromDb()");
      }
    },
    //
    //ADD Bank
    //
    async addBankDb(bank: Bank) {
      console.log("START - addBankDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(`/v1/finance/bank`, bank, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        this.banks.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getBankFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addBankDb()");
      }
    },
    //
    //UPDATE BANK
    //
    async updateBankDb(bank: Bank) {
      console.log("START - updateBankDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(`/v1/finance/bank`, bank, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.banks.findIndex((b) => b.id === bank.id);
        if (index !== -1) this.banks.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateBankDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateBankDb()");
      }
    },
    //
    //DELETE Bank
    //
    async deleteBankDb(bankId: number) {
      console.log("START - deleteBankDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        await httpCommon.delete(`/v1/finance/bank/` + bankId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.banks.findIndex((b) => b.id === bankId);
        if (index !== -1) this.banks.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteBankDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteBankDb()");
      }
    },
  },
});
