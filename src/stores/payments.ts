import { defineStore } from 'pinia';
import type { Payment, PaymentType } from '@/types/Payment';
import { PaymentStatus } from '@/types/Payment';
import type { Fee } from '@/types/Fee';
import type { Loan } from '@/types/Loan';
import httpCommon from '@/config/http-common';

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingPayments: false,
    paymentDetails: String,
    paymentSelectedYear: new Date().getFullYear(),
    paymentSelectedFilter: 'ALL' as string,

    payments: new Map<string, Payment[]>(),
  }),

  //getters = computed
  getters: {
    // getSortedInvoices: (state) =>
    //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
  },

  //actions = metody w komponentach
  actions: {
    //GET PAYMENTS BY USER
    //
    getPaymentsByUserID(userId: string) {
      const userPayments = this.payments.get(userId);
      if (!userPayments) return [];
      return userPayments.map((pay: Payment) => ({
        ...pay,
        installments: pay.installments.map(installment => ({
          ...installment,
          paymentDeadline: installment.paymentDeadline ? new Date(installment.paymentDeadline) : null,
          paymentDate: installment.paymentDate ? new Date(installment.paymentDate) : null,
        })),
      }));
    },
    //
    //UPDATE PAYMENT
    //
    updatePayment(paymentNew: Fee | Loan, type: PaymentType) {
      console.log('START - updatePayment() ', paymentNew);
      const idUser = paymentNew.idUser.toString();
      // console.log("user payments ", this.payments.get(idUser));
      if (this.payments) {
        const paymentOld = this.payments
          .get(idUser)
          ?.find((payment: Payment) => payment.id === paymentNew.id && payment.paymentType === type);
        console.log('type ', type);
        console.log('paymentOld ', paymentOld);
        if (paymentOld) paymentOld.installments = paymentNew.installmentList;
        console.log('END - updatePayment() ');
      }
    },
    //
    //UPDATE PAYMENT STATUS
    //
    updatePaymentStatus(paymentId: number, userId: number, type: PaymentType, status: PaymentStatus) {
      console.log('START - updatePaymentStatus() ');
      const idUser = userId.toString();
      if (this.payments) {
        const userPayments = this.payments.get(idUser);
        if (userPayments) {
          const paymentIndex = userPayments.findIndex(
            (payment: Payment) => payment.id === paymentId && payment.paymentType === type
          );

          if (paymentIndex !== -1) {
            const payment = userPayments[paymentIndex];

            // Aktualizacja statusu
            payment.paymentStatus = status;

            // Jeśli filtr jest ustawiony i nowy status nie pasuje do filtru, usuń płatność z listy
            const shouldRemove =
              (this.paymentSelectedFilter === 'TO_PAY' && status === PaymentStatus.PAID) ||
              (this.paymentSelectedFilter === 'PAID' && status === PaymentStatus.TO_PAY);

            if (shouldRemove) {
              userPayments.splice(paymentIndex, 1);
              console.log('Payment removed from list due to filter mismatch');
            }
          }
        }
        console.log('END - updatePaymentStatus() ');
      }
    },
    //
    //DELETE PAYMENT
    //
    deletePayment(payment: Fee | Loan, type: PaymentType | string) {
      console.log('START - deletePayment() ');
      const idUser = payment?.idUser.toString();
      if (this.payments && idUser && payment) {
        const index = this.payments
          .get(idUser)
          ?.findIndex((payment: Payment) => payment.id === payment.id && payment.paymentType === type);
        // console.log("type ", type);
        // console.log("index ", index);
        if (index !== undefined && index !== null && index !== -1) this.payments.get(idUser)?.splice(index, 1);
        // console.log("po ", this.payments.get(idUser));
      }
      console.log('END - deletePayment() ');
    },
    //
    //GET PAYMENTS FROM DB BY PAYMENT_STATUS AND YEAR
    //
    async getPaymentsFromDb(paymentStatus: string): Promise<void> {
      console.log('START - getPaymentsFromDb(' + paymentStatus + ', ' + this.paymentSelectedYear + ')');
      this.loadingPayments = true;
      this.paymentSelectedFilter = paymentStatus;

      // if (this.payments.size === 0) {
      const response = await httpCommon.get(
        `/v1/finance/payment?status=` + paymentStatus + '&date=' + this.paymentSelectedYear
      );
      console.log('getPaymentsFromDb() - Ilosc[]: ' + response.data.length);
      const paymentsTemp = new Map(Object.entries(response.data));
      this.payments = paymentsTemp as Map<string, Payment[]>;
      this.loadingPayments = false;
      console.log('END - getPaymentsFromDb(' + paymentStatus + ', ' + this.paymentSelectedYear + ')');
    },
  },
});
