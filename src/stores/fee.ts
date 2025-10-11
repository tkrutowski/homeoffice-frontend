import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Fee, FeeFrequency, FeeInstallment } from '@/types/Fee';
import type { StatusType } from '@/types/StatusType';
import moment from 'moment';
import { type Installment, PaymentStatus } from '@/types/Payment.ts';

export const useFeeStore = defineStore('fee', {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingFees: false,
    rowsPerPage: parseInt(localStorage.getItem('rowsPerPageFees') || '20', 10),
    loadingFeeFrequencyType: false,
    feeFrequencyTypes: [] as FeeFrequency[],

    fees: [] as Fee[],
    totalFees: 0,
    currentPage: 0,
    sortField: 'date',
    sortOrder: -1, // 1 = ASC, -1 = DESC - domyślnie sortujemy po dacie malejąco
    filters: {} as any,
  }),

  //getters = computed
  getters: {
    getFeesPaid: state => {
      return state.fees.filter((item: Fee) => item.feeStatus === PaymentStatus.PAID);
    },
    getFeesToPay: state => {
      return state.fees.filter((item: Fee) => item.feeStatus === PaymentStatus.TO_PAY);
    },
    feesSumToPay: state => {
      const fees: Fee[] = state.fees.filter((item: Fee) => item.feeStatus === PaymentStatus.TO_PAY);
      let sum = 0;
      fees.forEach((fee: Fee) => {
        const installmentSum = fee.installmentList
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
    //REFRESH FEES
    //
    async refreshFees() {
      await this.getFeesFromDb(this.currentPage);
      await this.getFeesSumToPayFromDb();
    },
    //
    //LOAD PAGE
    //
    async loadPage(page: number, rows?: number) {
      if (rows !== undefined) {
        this.rowsPerPage = rows;
        localStorage.setItem('rowsPerPageFees', rows.toString());
      }
      await this.getFeesFromDb(page);
    },
    //
    //SORT FEES
    //
    async sortFees(sortField: string, sortOrder: number) {
      console.log('sortFees()', sortField, sortOrder);
      this.sortField = sortField;
      this.sortOrder = sortOrder;
      await this.loadPage(0); // Reset to first page after sort
    },
    //
    //FILTER FEES
    //
    async filterFees(filters: any) {
      console.log('filterFees()', filters);
      this.filters = filters;
      await this.loadPage(0); // Reset to first page after filter
    },
    //
    //GET FEES FROM DB BY PAYMENT_STATUS
    //
    async getFees(status: StatusType) {
      console.log('START - getFees(' + status + ')');
      if (this.fees.length === 0) {
        const filters: any = {
          global: { value: null, matchMode: 'contains' },
        };

        if (status === 'TO_PAY' || status === 'PAID') {
          filters.feeStatus = { value: status, matchMode: 'equals' };
        }

        await this.filterFees(filters);
      }
      console.log('END - getFees(' + status + ')');

      switch (status) {
        case 'TO_PAY':
          return this.fees.filter((item: Fee) => item.feeStatus === PaymentStatus.TO_PAY);
        case 'PAID':
          return this.fees.filter((item: Fee) => item.feeStatus === PaymentStatus.PAID);
        case 'ALL':
        default:
          return this.fees;
      }
    },
    getFee(idFee: number) {
      return this.fees.find(item => item.id === idFee);
    },
    //----------------------------------------------DATABASE--------------------------------------------
    //
    //GET FEES FROM DB WITH PAGINATION
    //
    async getFeesFromDb(page: number = 0, size?: number): Promise<void> {
      const pageSize = size || this.rowsPerPage;
      console.log(`START - getFeesFromDb(page: ${page}, size: ${pageSize})`);
      this.loadingFees = true;

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
      if (this.filters['firm.name']?.value) {
        params.append('firmName', this.filters['firm.name'].value);
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
      if (this.filters.feeStatus?.value) {
        params.append('status', this.filters.feeStatus.value);
      }

      const response = await httpCommon.get(`/v1/finance/fee/page?${params.toString()}`);
      console.log('getFeesFromDb() - Ilość[]: ' + response.data.content.length);
      this.fees = response.data.content.map((fee: any) => this.convertResponse(fee));
      this.totalFees = response.data.totalElements;
      this.currentPage = response.data.number;
      this.loadingFees = false;
      console.log('END - getFeesFromDb()');
    },
    //
    //GET FEE FROM DB BY ID
    //
    async getFeeFromDb(feeId: number): Promise<Fee | null> {
      console.log('START - getFeeFromDb(' + feeId + ')');
      this.loadingFees = true;

      const response = await httpCommon.get(`/v1/finance/fee/` + feeId);
      this.loadingFees = false;
      console.log('END - getFeeFromDb()');
      if (response.data) {
        return this.convertResponse(response.data);
      } else return null;
    },
    //
    //GET SUM TO PAY FROM DB
    //
    async getFeesSumToPayFromDb(): Promise<number> {
      console.log('START - getFeesSumToPayFromDb()');

      // Since we already have feesSumToPay getter that calculates from loaded fees,
      // we can just return it. If backend has endpoint, implement it here.
      console.log('END - getFeesSumToPayFromDb(), suma:', this.feesSumToPay);
      return this.feesSumToPay;
    },
    //
    //CHANGE PAYMENT_STATUS
    //
    async updateFeeStatusDb(feeId: number, status: PaymentStatus) {
      console.log('START - updateFeeStatusDb()');

      await httpCommon.put(`/v1/finance/fee/status/` + feeId, {
        value: status,
      });
      const fee = this.fees.find((fee: Fee) => fee.id === feeId);
      if (fee) {
        fee.feeStatus = status;
      }
      console.log('END - updateFeeStatusDb()');
    },
    //
    //ADD Fee
    //
    async addFeeDb(fee: Fee) {
      console.log('START - addFeeDb()', fee);
      const transformedFee = {
        ...fee,
        date: fee.date ? moment(fee.date).format('YYYY-MM-DD') : null,
        firstPaymentDate: fee.firstPaymentDate ? moment(fee.firstPaymentDate).format('YYYY-MM-DD') : null,
      };
      console.log('START - addFeeDb()', transformedFee);
      const response = await httpCommon.post(`/v1/finance/fee`, transformedFee);
      this.fees.push(response.data);
      console.log('END - addFeeDb()');
    },
    //
    //UPDATE FEE
    //
    async updateFeeDb(fee: Fee) {
      console.log('START - updateFeeDb()');

      const response = await httpCommon.put(`/v1/finance/fee`, fee);
      const index = this.fees.findIndex((f: Fee) => f.id === fee.id);
      if (index !== -1) this.fees.splice(index, 1, response.data);
      console.log('END - updateFeeDb()');
    },
    //
    //DELETE FEE
    //
    async deleteFeeDb(feeId: number) {
      console.log('START - deleteFeeDb()');
      await httpCommon.delete(`/v1/finance/fee/` + feeId);
      const index = this.fees.findIndex((f: Fee) => f.id === feeId);
      if (index !== -1) this.fees.splice(index, 1);
      console.log('END - deleteFeeDb()');
    },
    //
    //GET PAYMENT TYPE
    //
    async getFeeFrequencyType() {
      console.log('START - getFeeFrequencyType()');
      this.loadingFeeFrequencyType = true;
      if (this.feeFrequencyTypes.length === 0) {
        const response = await httpCommon.get(`/v1/finance/fee/frequency`);
        this.feeFrequencyTypes = response.data;
      } else {
        console.log('getFeeFrequencyType() - BEZ GET');
      }
      this.loadingFeeFrequencyType = false;
      console.log('END - getFeeFrequencyType()');
    },
    //
    //UPDATE FEE_INSTALLMENT (PAYMENT)
    //
    async updateFeeInstallmentDb(installment: FeeInstallment) {
      console.log('START - updateFeeInstallmentDb()');

      const transformedFeeInstallment = {
        ...installment,
        paymentDeadline: installment.paymentDeadline ? moment(installment.paymentDeadline).format('YYYY-MM-DD') : null,
        paymentDate: installment.paymentDate ? moment(installment.paymentDate).format('YYYY-MM-DD') : null,
      };
      const response = await httpCommon.put(`/v1/finance/fee/installment`, transformedFeeInstallment);
      const fee: Fee | undefined = this.fees.find((fee: Fee) => fee.id === installment.idFee);
      console.log('END - updateFeeInstallmentDb()');
      if (fee) {
        const index = fee.installmentList.findIndex(
          (f: FeeInstallment) => f.idFeeInstallment === installment.idFeeInstallment
        );
        if (index !== -1) fee.installmentList.splice(index, 1, response.data);
        return fee;
      } else return null;
    },

    convertResponse(fee: Fee) {
      return {
        ...fee,
        date: fee.date ? new Date(fee.date) : null,
      };
    },
  },
});
