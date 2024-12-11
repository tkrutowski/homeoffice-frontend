import {defineStore} from 'pinia'
import {ErrorService} from '../service/ErrorService'
import type {Payment, PaymentType} from '../types/Payment'
import type {Fee} from '../types/Fee'
import type {Loan} from '../types/Loan'
import httpCommon from '../config/http-common'

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        loginError: false,
        btnDisabled: false,
        busyIcon: false,
        loadingPayments: false,
        paymentDetails: String,
        paymentSelectedYear: new Date().getFullYear(),

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
            const userPayments = this.payments.get(userId)
            if (!userPayments) return []
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
            console.log('START - updatePayment() ', paymentNew)
            const idUser = paymentNew.idUser.toString()
            // console.log("user payments ", this.payments.get(idUser));
            if (this.payments) {
                const paymentOld = this.payments
                    .get(idUser)
                    ?.find((payment: Payment) => payment.id === paymentNew.id && payment.paymentType === type)
                console.log('type ', type)
                console.log('paymentOld ', paymentOld)
                if (paymentOld) paymentOld.installments = paymentNew.installmentList
                console.log('END - updatePayment() ')
            }
        },
        //
        //DELETE PAYMENT
        //
        deletePayment(payment: Fee | Loan, type: PaymentType | string) {
            console.log('START - deletePayment() ')
            const idUser = payment?.idUser.toString()
            if (this.payments && idUser && payment) {
                const index = this.payments
                    .get(idUser)
                    ?.findIndex((payment: Payment) => payment.id === payment.id && payment.paymentType === type)
                // console.log("type ", type);
                // console.log("index ", index);
                if (index !== undefined && index !== null && index !== -1)
                    this.payments.get(idUser)?.splice(index, 1)
                // console.log("po ", this.payments.get(idUser));
            }
            console.log('END - deletePayment() ')
        },
        //
        //GET PAYMENTS FROM DB BY PAYMENT_STATUS AND YEAR
        //
        async getPaymentsFromDb(paymentStatus: string): Promise<void> {
            console.log(
                'START - getPaymentsFromDb(' + paymentStatus + ', ' + this.paymentSelectedYear + ')',
            )
            this.loadingPayments = true

            try {
                // if (this.payments.size === 0) {
                const response = await httpCommon.get(
                    `/v1/finance/payment?status=` + paymentStatus + '&date=' + this.paymentSelectedYear,
                )
                console.log('getPaymentsFromDb() - Ilosc[]: ' + response.data)
                const paymentsTemp = new Map(Object.entries(response.data))
                this.payments = paymentsTemp as Map<string, Payment[]>
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getPaymentsFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
            } finally {
                this.loadingPayments = false
                console.log(
                    'END - getPaymentsFromDb(' + paymentStatus + ', ' + this.paymentSelectedYear + ')',
                )
            }
        },
    },
})
