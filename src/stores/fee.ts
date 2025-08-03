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
    async refreshLoans() {
      await this.getFeesFromDb('ALL', true);
    },
    //
    //GET FEES FROM DB BY PAYMENT_STATUS
    //
    async getFees(status: StatusType) {
      console.log('START - getFees(' + status + ')');

      if (this.fees.length === 0) {
        await this.getFeesFromDb('ALL', true);
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
    //GET FEES FROM DB BY PAYMENT_STATUS
    //
    async getFeesFromDb(paymentStatus: string, installment: boolean): Promise<void> {
      console.log('START - getFeesFromDb(' + paymentStatus + ', ' + installment + ')');
      this.loadingFees = true;

      const response = await httpCommon.get(
        `/v1/finance/fee/status?status=` + paymentStatus + '&installment=' + installment
      );
      console.log('getFeesFromDb() - Ilosc[]: ' + response.data.length);
      this.fees = response.data.map((fee: any) => this.convertResponse(fee));
      this.loadingFees = false;
      console.log('END - getFeesFromDb(' + paymentStatus + ', ' + installment + ')');
    },
    //
    //GET FEE FROM DB BY ID
    //
    async getFeeFromDb(feeId: number): Promise<Fee | null> {
      console.log('START - getFeeFromDb(' + feeId + ')');
      this.loadingFees = true;

      const response = await httpCommon.get(`/v1/finance/fee/` + feeId);
      this.loadingFees = false;
      console.log('END - getFeesFromDb()');
      if (response.data) {
        return this.convertResponse(response.data);
      } else return null;
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
