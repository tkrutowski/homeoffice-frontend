import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { PaymentStatus } from "@/assets/types/PaymentStatus";
import { ErrorService } from "@/service/ErrorService";
import { Fee, FeeFrequency, FeeInstallment } from "@/assets/types/Fee";
import StatusType from "@/assets/types/StatusType";

export const useFeeStore = defineStore("fee", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingFees: false,
    loadingFeeFrequencyType: false,
    feeFrequencyTypes: [] as FeeFrequency[],

    fees: [] as Fee[],
  }),

  //getters = computed
  getters: {
    getFeesPaid: (state) => {
      return state.fees.filter((item) => item.feeStatus.name === "PAID");
    },
    getFeesToPay: (state) => {
      return state.fees.filter((item) => item.feeStatus.name === "TO_PAY");
    },
  },

  //actions = metody w komponentach
  actions: {
    //
    //REFRESH FEES
    //
    async refreshLoans() {
      await this.getFeesFromDb("ALL", true);
    },
    //
    //GET FEES FROM DB BY PAYMENT_STATUS
    //
    async getFees(status: StatusType) {
      console.log("START - getFees(" + status + ")");

      if (this.fees.length === 0) {
        await this.getFeesFromDb("ALL", true);
      }
      console.log("END - getFees(" + status + ")");
      switch (status) {
        case "TO_PAY":
          return this.fees.filter((item) => item.feeStatus.name === "TO_PAY");
        case "PAID":
          return this.fees.filter((item) => item.feeStatus.name === "PAID");
        case "ALL":
        default:
          return this.fees;
      }
    },
    //
    //GET FEES FROM DB BY PAYMENT_STATUS
    //
    async getFeesFromDb(
      paymentStatus: string,
      installment: boolean
    ): Promise<void> {
      console.log(
        "START - getFeesFromDb(" + paymentStatus + ", " + installment + ")"
      );
      this.loadingFees = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.get(
          `/v1/finance/fee/status?status=` +
            paymentStatus +
            "&installment=" +
            installment,
          {
            headers: authorization.token !== "null" ? headers : {},
          }
        );
        console.log("getFeesFromDb() - Ilosc[]: " + response.data.length);
        this.fees = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getFeesFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingFees = false;
        console.log(
          "END - etFeesFromDb(" + paymentStatus + ", " + installment + ")"
        );
      }
    },
    //
    //GET FEE FROM DB BY ID
    //
    async getFeeFromDb(feeId: number): Promise<Fee | undefined> {
      console.log("START - getFeeFromDb(" + feeId + ")");
      this.loadingFees = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.get(`/v1/finance/fee/` + feeId, {
          headers: authorization.token !== "null" ? headers : {},
        });
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getFeeFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingFees = false;
        console.log("END - getFeesFromDb()");
      }
    },
    //
    //CHANGE PAYMENT_STATUS
    //
    async updateFeeStatusDb(feeId: number, status: PaymentStatus) {
      console.log("START - updateFeeStatusDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        await httpCommon.put(
          `/v1/finance/fee/status/` + feeId,
          { value: status.name },
          {
            headers: authorization.token !== "null" ? headers : {},
          }
        );
        const fee = this.fees.find((l) => l.id === feeId);
        if (fee) {
          fee.feeStatus = status;
        }
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateFeeStatusDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateFeeStatusDb()");
      }
    },
    //
    //ADD Fee
    //
    async addFeeDb(fee: Fee) {
      console.log("START - addFeeDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.post(`/v1/finance/fee`, fee, {
          headers: authorization.token !== "null" ? headers : {},
        });
        this.fees.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addFeeDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addFeeDb()");
      }
    },
    //
    //UPDATE FEE
    //
    async updateFeeDb(fee: Fee) {
      console.log("START - updateFeeDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.put(`/v1/finance/fee`, fee, {
          headers: authorization.token !== "null" ? headers : {},
        });
        const index = this.fees.findIndex((f) => f.id === fee.id);
        if (index !== -1) this.fees.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateFeeDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateFeeDb()");
      }
    },
    //
    //DELETE FEE
    //
    async deleteFeeDb(feeId: number) {
      console.log("START - deleteFeeDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        await httpCommon.delete(`/v1/finance/fee/` + feeId, {
          headers: authorization.token !== "null" ? headers : {},
        });
        const index = this.fees.findIndex((f) => f.id === feeId);
        if (index !== -1) this.fees.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteFeeDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteFeeDb()");
      }
    },
    //
    //GET PAYMENT TYPE
    //
    async getFeeFrequencyType() {
      console.log("START - getFeeFrequencyType()");
      this.loadingFeeFrequencyType = true;
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        if (this.feeFrequencyTypes.length === 0) {
          const response = await httpCommon.get(`/v1/finance/fee/frequency`, {
            headers: authorization.token !== "null" ? headers : {},
          });
          this.feeFrequencyTypes = response.data;
        } else {
          console.log("getFeeFrequencyType() - BEZ GET");
        }
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getFeeFrequencyType(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingFeeFrequencyType = false;
        console.log("END - getFeeFrequencyType()");
      }
    },
    //
    //UPDATE FEE_INSTALLMENT (PAYMENT)
    //
    async updateFeeInstallmentDb(installment: FeeInstallment) {
      console.log("START - updateFeeInstallmentDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.token,
      };
      try {
        const response = await httpCommon.put(
          `/v1/finance/fee/installment`,
          installment,
          {
            headers: authorization.token !== "null" ? headers : {},
          }
        );
        const fee: Fee | undefined = this.fees.find(
          (l) => l.id === installment.idFee
        );
        if (fee) {
          const index = fee.installmentList.findIndex(
            (f) => f.idFeeInstallment === installment.idFeeInstallment
          );
          console.log("index ", index);
          if (index !== -1) fee.installmentList.splice(index, 1, response.data);
        }
        return fee;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateFeeInstallmentDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        console.log("END - updateFeeInstallmentDb()");
      }
    },
  },
});
