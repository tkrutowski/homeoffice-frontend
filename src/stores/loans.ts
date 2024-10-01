import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { Loan, LoanInstallment } from "@/types/Loan";
import { useAuthorizationStore } from "@/stores/authorization";
import { PaymentStatus } from "@/types/PaymentStatus";
import { PaymentMethod } from "@/types/PaymentMethod";
import { ErrorService } from "@/service/ErrorService";
import StatusType from "@/types/StatusType";

export const useLoansStore = defineStore("loan", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingLoans: false,

    loadingInvoiceNo: false,
    loadingPaymentType: false,
    loadingFile: false,
    loadingWait: false,
    loans: [] as Loan[],
    paymentTypes: [] as PaymentMethod[],
  }),

  //getters = computed
  getters: {
    getLoansPaid: (state) => {
      return state.loans.filter((item) => item.loanStatus.name === "PAID");
    },
    getLoansToPay: (state) => {
      return state.loans.filter((item) => item.loanStatus.name === "TO_PAY");
    },
    loansSumToPay: (state) => {
      const loans: Loan[] = state.loans.filter(
        (item) => item.loanStatus.name === "TO_PAY"
      );
      let sum = 0;
      loans.forEach((loan) => {
        const installmentSum = loan.installmentList
          .filter((value) => value.paymentStatus.name === "TO_PAY")
          .map((value) => value.installmentAmountToPay)
          .reduce((acc, currentValue) => acc + currentValue, 0);

        sum += installmentSum;
      });

      return sum;
    },
  },

  //actions = metody w komponentach
  actions: {
    //
    //REFRESH LOANS
    //
    async refreshLoans() {
      await this.getLoansFromDb("ALL", true);
    },
    //
    //GET LOANS
    //
    async getLoans(status: StatusType) {
      console.log("START - getLoans(" + status + ")");
      if (this.loans.length === 0) {
        await this.getLoansFromDb("ALL", true);
      }
      console.log("END - getLoans(" + status + ")");

      switch (status) {
        case "TO_PAY":
          return this.loans.filter((item) => item.loanStatus.name === "TO_PAY");
        case "PAID":
          return this.loans.filter((item) => item.loanStatus.name === "PAID");
        case "ALL":
        default:
          return this.loans;
      }
    },

    //
    //GET LOANS FROM DB BY PAYMENT_STATUS
    //
    async getLoansFromDb(
      paymentStatus: string,
      installment: boolean
    ): Promise<void> {
      console.log(
        "START - getLoansFromDb(" + paymentStatus + ", " + installment + ")"
      );
      this.loadingLoans = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(
          `/v1/finance/loan/status?status=` +
            paymentStatus +
            "&installment=" +
            installment,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        console.log("getLoansFromDb() - Ilosc[]: " + response.data.length);
        this.loans = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getLoansFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingLoans = false;
        console.log(
          "END - etLoansFromDb(" + paymentStatus + ", " + installment + ")"
        );
      }
    },
    //
    //GET  LOAN FROM DB BY ID
    //
    async getLoanFromDb(loanId: number): Promise<Loan | undefined> {
      console.log("START - getLoanFromDb(" + loanId + ")");
      this.loadingLoans = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(`/v1/finance/loan/` + loanId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getLoanFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingLoans = false;
        console.log("END - getLoansFromDb()");
      }
    },
    //
    //CHANGE PAYMENT_STATUS
    //
    async updateLoanStatusDb(loanId: number, status: PaymentStatus) {
      console.log("START - updateLoanStatusDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        await httpCommon.put(
          `/v1/finance/loan/status/` + loanId,
          { value: status.name },
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        const loan = this.loans.find((l) => l.id === loanId);
        if (loan) {
          loan.loanStatus = status;
        }
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateLoanStatusDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateLoanStatusDb()");
      }
    },
    //
    //ADD Loan
    //
    async addLoanDb(loan: Loan) {
      console.log("START - addLoanDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(`/v1/finance/loan`, loan, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        this.loans.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR: ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addLoanDb()");
      }
    },
    //
    //UPDATE LOAN
    //
    async updateLoanDb(loan: Loan) {
      console.log("START - updateLoanDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(`/v1/finance/loan`, loan, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.loans.findIndex((l) => l.id === loan.id);
        if (index !== -1) this.loans.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateLoanDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateLoanDb()");
      }
    },
    //
    //DELETE LOAN
    //
    async deleteLoanDb(loanId: number) {
      console.log("START - deleteLoanDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        await httpCommon.delete(`/v1/finance/loan/` + loanId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.loans.findIndex((l) => l.id === loanId);
        if (index !== -1) this.loans.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteLoanDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteLoanDb()");
      }
    },

    //
    //GET PAYMENT TYPE
    //
    async getPaymentType() {
      console.log("START - getPaymentType()");
      this.loadingPaymentType = true;
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        if (this.paymentTypes.length === 0) {
          const response = await httpCommon.get(
            `/v1/goahead/invoice/paymenttype`,
            {
              headers: authorization.accessToken !== "null" ? headers : {},
            }
          );
          this.paymentTypes = response.data;
        } else {
          console.log("getPaymentType() - BEZ GET");
        }
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getPaymentType(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingPaymentType = false;
        console.log("END - getPaymentType()");
      }
    },
    //
    //UPDATE LOAN_INSTALLMENT (PAYMENT)
    //
    async updateLoanInstallmentDb(installment: LoanInstallment) {
      console.log("START - updateLoanInstallmentDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(
          `/v1/finance/loan/installment`,
          installment,
          {
            headers: authorization.accessToken !== "null" ? headers : {},
          }
        );
        console.log("loan store ", this.loans);
        const loan = this.loans.find((l) => l.id === installment.idLoan);
        console.log("loan store ", loan);
        if (loan) {
          const index = loan.installmentList.findIndex(
            (l) => l.idLoanInstallment === installment.idLoanInstallment
          );
          console.log("index ", index);
          if (index !== -1)
            loan.installmentList.splice(index, 1, response.data);
        }
        return loan;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateLoanInstallmentDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        console.log("END - updateLoanInstallmentDb()");
      }
    },
  },
});
