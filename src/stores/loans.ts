import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Loan, LoanInstallment } from '@/types/Loan';
import type { StatusType } from '@/types/StatusType';
import { type Installment, PaymentStatus, PaymentMethod } from '@/types/Payment.ts';
import moment from 'moment/moment';

export const useLoansStore = defineStore('loan', {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingLoans: false,
    rowsPerPage: parseInt(localStorage.getItem('rowsPerPageLoans') || '20', 10),

    loadingInvoiceNo: false,
    loadingPaymentType: false,
    loadingFile: false,
    loadingWait: false,
    loans: [] as Loan[],
    totalLoans: 0,
    currentPage: 0,
    paymentTypes: [] as PaymentMethod[],
    sortField: 'date',
    sortOrder: -1, // 1 = ASC, -1 = DESC - domyślnie sortujemy po dacie malejąco
    filters: {} as any,
  }),

  //getters = computed
  getters: {
    getLoansPaid: state => {
      return state.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.PAID);
    },
    getLoansToPay: state => {
      return state.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.TO_PAY);
    },
    loansSumToPay: state => {
      const loans: Loan[] = state.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.TO_PAY);
      let sum = 0;
      loans.forEach((loan: Loan) => {
        const installmentSum = loan.installmentList
          .filter((value: Installment) => value.paymentStatus === PaymentStatus.TO_PAY)
          .map((value: Installment) => value.installmentAmountToPay)
          .reduce((acc: number, currentValue: number) => acc + currentValue, 0);

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
      await this.getLoansFromDb(this.currentPage);
      await this.getLoansSumToPayFromDb();
    },
    //
    //LOAD PAGE
    //
    async updateRowsPerPage(rows: number) {
      console.log(`updateRowsPerPage(rows: ${rows})`);
      if (rows !== undefined) {
        this.rowsPerPage = rows;
        localStorage.setItem('rowsPerPageLoans', rows.toString());
      }
    },
    //
    //SORT LOANS
    //
    async sortLoans(sortField: string, sortOrder: number) {
      console.log('sortLoans()', sortField, sortOrder);
      this.sortField = sortField;
      this.sortOrder = sortOrder;
      await this.getLoansFromDb(0); // Reset to first page after sort
    },
    //
    //FILTER LOANS
    //
    async filterLoans(filters: any, rows?: number) {
      console.log(`filterLoans(${filters.toString()}, rows: ${rows})`);
      this.filters = filters;
      if (rows !== undefined) {
        await this.getLoansFromDb(0, rows); // Reset to first page after filter
      } else {
        await this.getLoansFromDb(0); // Reset to first page after filter
      }
    },
    //
    //GET LOANS
    //
    async getLoans(status: StatusType, userId?: number, rows?: number) {
      console.log(`START - getLoans(status: ${status}, userId: ${userId}, rows: ${rows} ')`);
      if (this.loans.length === 0) {
        const filters: any = {
          global: { value: null, matchMode: 'contains' },
        };

        if (status === 'TO_PAY' || status === 'PAID') {
          filters.loanStatus = { value: status, matchMode: 'equals' };
        }

        if (userId) {
          filters.idUser = { value: userId, matchMode: 'equals' };
        }
        if (rows !== undefined) {
          await this.filterLoans(filters, rows);
        } else {
          await this.filterLoans(filters);
        }
      }
      console.log('END - getLoans(' + status + ')');

      switch (status) {
        case 'TO_PAY':
          return this.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.TO_PAY);
        case 'PAID':
          return this.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.PAID);
        case 'ALL':
        default:
          return this.loans;
      }
    },
    getLoan(idLoan: number) {
      return this.loans.find((item: Loan) => item.id === idLoan);
    },

    //
    //GET LOANS BY YEAR, STATUS AND USER
    //
    async getLoansByYearAndStatusAndUser(year: number, status: StatusType, userId?: number): Promise<Loan[]> {
      console.log(`START - getLoansByYearAndStatusAndUser(${year}, ${status}, ${userId})`);
      this.loadingLoans = true;
      // Clear existing loans to ensure fresh data
      this.loans = [];

      await this.getLoans(status, userId, 1000);

      // Filter loans that have installments in the specified year
      const filteredLoans = this.loans.filter(loan => {
        return loan.installmentList.some(installment => {
          if (installment.paymentDeadline) {
            const installmentYear = new Date(installment.paymentDeadline).getFullYear();
            return installmentYear === year;
          }
          return false;
        });
      });

      this.loadingLoans = false;
      console.log(`END - getLoansByYearAndUser(), found ${filteredLoans.length} loans`);
      return filteredLoans;
    },
    //------------------------------------------------DATABASE--------------------------------
    //
    //GET LOANS FROM DB WITH PAGINATION
    //
    async getLoansFromDb(page: number = 0, size?: number): Promise<void> {
      const pageSize = size || this.rowsPerPage;
      console.log(`START - getLoansFromDb(page: ${page}, size: ${pageSize})`);
      this.loadingLoans = true;

      // parameters
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sort: this.sortField,
        direction: this.sortOrder > 0 ? 'ASC' : 'DESC',
      });

      // filters
      if (this.filters.global?.value) {
        params.append('globalFilter', this.filters.global.value);
      }
      if (this.filters.name?.value) {
        params.append('name', this.filters.name.value);
      }
      if (this.filters.idBank?.value) {
        params.append('idBank', this.filters.idBank.value.toString());
      }
      if (this.filters.idUser?.value) {
        params.append('idUser', this.filters.idUser.value.toString());
      }
      if (this.filters.date?.constraints?.[0]?.value) {
        const date = new Date(this.filters.date.constraints[0].value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        params.append('date', `${year}-${month}-${day}`);

        // Map PrimeVue FilterMatchMode to backend dateComparisonType
        const matchMode = this.filters.date.constraints[0].matchMode;
        let dateComparisonType = 'EQUALS';

        if (matchMode === 'dateIs') {
          dateComparisonType = 'EQUALS';
        } else if (matchMode === 'dateBefore') {
          dateComparisonType = 'BEFORE';
        } else if (matchMode === 'dateAfter') {
          dateComparisonType = 'AFTER';
        }

        params.append('dateComparisonType', dateComparisonType);
      }
      if (this.filters.amount?.constraints?.[0]?.value) {
        params.append('amount', this.filters.amount.constraints[0].value.toString());

        // Map PrimeVue FilterMatchMode to backend amountComparisonType
        const matchMode = this.filters.amount.constraints[0].matchMode;
        let amountComparisonType = 'EQUALS';

        if (matchMode === 'equals') {
          amountComparisonType = 'EQUALS';
        } else if (matchMode === 'lt') {
          amountComparisonType = 'LESS_THAN';
        } else if (matchMode === 'lte') {
          amountComparisonType = 'LESS_THAN_OR_EQUAL';
        } else if (matchMode === 'gt') {
          amountComparisonType = 'GREATER_THAN';
        } else if (matchMode === 'gte') {
          amountComparisonType = 'GREATER_THAN_OR_EQUAL';
        }

        params.append('amountComparisonType', amountComparisonType);
      }
      if (this.filters.loanStatus?.value) {
        params.append('status', this.filters.loanStatus.value);
      }

      console.log('LOANS params: ' + params.toString());
      const response = await httpCommon.get(`/v1/finance/loan/page?${params.toString()}`);
      console.log('getLoansFromDb() - Ilość[]: ' + response.data.content.length);
      this.loans = response.data.content.map((loan: any) => this.convertResponse(loan));
      this.totalLoans = response.data.totalElements;
      this.currentPage = response.data.number;
      this.loadingLoans = false;
      console.log('END - getLoansFromDb()');
    },
    //
    //GET  LOAN FROM DB BY ID
    //
    async getLoanFromDb(loanId: number): Promise<Loan | null> {
      console.log('START - getLoanFromDb(' + loanId + ')');
      this.loadingLoans = true;

      const response = await httpCommon.get(`/v1/finance/loan/` + loanId);
      this.loadingLoans = false;
      if (response.data) {
        console.log('END - getLoanFromDb()');
        return this.convertResponse(response.data);
      } else {
        console.log('END - getLoanFromDb()');
        return null;
      }
    },
    //
    //GET SUM TO PAY FROM DB
    //
    async getLoansSumToPayFromDb(): Promise<number> {
      console.log('START - getLoansSumToPayFromDb()');

      // Since we already have loansSumToPay getter that calculates from loaded loans,
      // we can just return it. If backend has endpoint, implement it here.
      console.log('END - getLoansSumToPayFromDb(), suma:', this.loansSumToPay);
      return this.loansSumToPay;
    },
    //
    //CHANGE PAYMENT_STATUS
    //
    async updateLoanStatusDb(loanId: number, status: PaymentStatus) {
      console.log('START - updateLoanStatusDb()');

      await httpCommon.put(`/v1/finance/loan/status/` + loanId, {
        value: status,
      });
      const loan = this.loans.find((l: Loan) => l.id === loanId);
      if (loan) {
        loan.loanStatus = status;
      }
      console.log('END - updateLoanStatusDb()');
      return true;
    },
    //
    //ADD Loan
    //
    async addLoanDb(loan: Loan) {
      console.log('START - addLoanDb()');
      const transformedLoan = {
        ...loan,
        date: loan.date ? moment(loan.date).format('YYYY-MM-DD') : null,
        firstPaymentDate: loan.firstPaymentDate ? moment(loan.firstPaymentDate).format('YYYY-MM-DD') : null,
      };
      const response = await httpCommon.post(`/v1/finance/loan`, transformedLoan);
      this.loans.push(response.data);
      console.log('END - addLoanDb()');
    },
    //
    //UPDATE LOAN
    //
    async updateLoanDb(loan: Loan) {
      console.log('START - updateLoanDb()');
      const transformedLoan = {
        ...loan,
        date: loan.date ? moment(loan.date).format('YYYY-MM-DD') : null,
        firstPaymentDate: loan.firstPaymentDate ? moment(loan.firstPaymentDate).format('YYYY-MM-DD') : null,
      };
      const response = await httpCommon.put(`/v1/finance/loan`, transformedLoan);
      const index = this.loans.findIndex((l: Loan) => l.id === loan.id);
      if (index !== -1) this.loans.splice(index, 1, response.data);
      console.log('END - updateLoanDb()');
    },
    //
    //DELETE LOAN
    //
    async deleteLoanDb(loanId: number) {
      console.log('START - deleteLoanDb()');
      await httpCommon.delete(`/v1/finance/loan/` + loanId);
      const index = this.loans.findIndex((l: Loan) => l.id === loanId);
      if (index !== -1) this.loans.splice(index, 1);
      console.log('END - deleteLoanDb()');
      return true;
    },

    //
    //UPDATE LOAN_INSTALLMENT (PAYMENT)
    //
    async updateLoanInstallmentDb(installment: LoanInstallment) {
      console.log('START - updateLoanInstallmentDb()');

      const transformedLoanInstallment = {
        ...installment,
        paymentDeadline: installment.paymentDeadline ? moment(installment.paymentDeadline).format('YYYY-MM-DD') : null,
        paymentDate: installment.paymentDate ? moment(installment.paymentDate).format('YYYY-MM-DD') : null,
      };

      const response = await httpCommon.put(`/v1/finance/loan/installment`, transformedLoanInstallment);
      console.log('loan store ', this.loans);
      const loan = this.loans.find((l: Loan) => l.id === installment.idLoan);
      console.log('loan store ', loan);
      if (loan) {
        const index = loan.installmentList.findIndex(
          (l: LoanInstallment) => l.idLoanInstallment === installment.idLoanInstallment
        );
        console.log('index ', index);
        if (index !== -1) loan.installmentList.splice(index, 1, response.data);
      }
      console.log('END - updateLoanInstallmentDb()');
      return loan;
    },

    convertResponse(loan: Loan) {
      return {
        ...loan,
        date: loan.date ? new Date(loan.date) : null,
      };
    },
  },
});
