import {defineStore} from 'pinia'
import httpCommon from '@/config/http-common'
import type {Loan, LoanInstallment} from '@/types/Loan'
import type {StatusType} from '@/types/StatusType'
import {type Installment, PaymentStatus, PaymentMethod} from "@/types/Payment.ts";
import moment from "moment/moment";

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
        paymentTypes: [] as PaymentMethod[],
    }),

    //getters = computed
    getters: {
        getLoansPaid: (state) => {
            return state.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.PAID)
        },
        getLoansToPay: (state) => {
            return state.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.TO_PAY)
        },
        loansSumToPay: (state) => {
            const loans: Loan[] = state.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.TO_PAY)
            let sum = 0
            loans.forEach((loan: Loan) => {
                const installmentSum = loan.installmentList
                    .filter((value: Installment) => value.paymentStatus === PaymentStatus.TO_PAY)
                    .map((value: Installment) => value.installmentAmountToPay)
                    .reduce((acc: number, currentValue: number) => acc + currentValue, 0)

                sum += installmentSum
            })

            return sum
        },
    },

    //actions = metody w komponentach
    actions: {
        //
        //REFRESH LOANS
        //
        async refreshLoans() {
            await this.getLoansFromDb('ALL', true)
        },
        //
        //GET LOANS
        //
        async getLoans(status: StatusType) {
            console.log('START - getLoans(' + status + ')')
            if (this.loans.length === 0) {
                await this.getLoansFromDb('ALL', true)
            }
            console.log('END - getLoans(' + status + ')')

            switch (status) {
                case 'TO_PAY':
                    return this.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.TO_PAY)
                case 'PAID':
                    return this.loans.filter((item: Loan) => item.loanStatus === PaymentStatus.PAID)
                case 'ALL':
                default:
                    return this.loans
            }
        },
        getLoan(idLoan: number) {
            return this.loans.find((item: Loan) => item.id === idLoan)
        },
        //------------------------------------------------DATABASE--------------------------------
        //
        //GET LOANS FROM DB BY PAYMENT_STATUS
        //
        async getLoansFromDb(paymentStatus: string, installment: boolean): Promise<void> {
            console.log('START - getLoansFromDb(' + paymentStatus + ', ' + installment + ')')
            this.loadingLoans = true
            const response = await httpCommon.get(
                `/v1/finance/loan/status?status=` + paymentStatus + '&installment=' + installment,
            )
            console.log('getLoansFromDb() - Ilosc[]: ' + response.data.length)
            this.loans = response.data
            this.loadingLoans = false
            console.log('END - etLoansFromDb(' + paymentStatus + ', ' + installment + ')')
        },
        //
        //GET  LOAN FROM DB BY ID
        //
        async getLoanFromDb(loanId: number): Promise<Loan | null> {
            console.log('START - getLoanFromDb(' + loanId + ')')
            this.loadingLoans = true

            const response = await httpCommon.get(`/v1/finance/loan/` + loanId)
            this.loadingLoans = false
            if (response.data) {
                console.log('END - getLoansFromDb()')
                return response.data
            } else {
                console.log('END - getLoansFromDb()')
                return null
            }
        },
        //
        //CHANGE PAYMENT_STATUS
        //
        async updateLoanStatusDb(loanId: number, status: PaymentStatus) {
            console.log('START - updateLoanStatusDb()')

            await httpCommon.put(`/v1/finance/loan/status/` + loanId, {value: status})
            const loan = this.loans.find((l: Loan) => l.id === loanId)
            if (loan) {
                loan.loanStatus = status
            }
            console.log('END - updateLoanStatusDb()')
            return true
        },
        //
        //ADD Loan
        //
        async addLoanDb(loan: Loan) {
            console.log('START - addLoanDb()')
            const transformedLoan = {
                ...loan,
                date: loan.date ? moment(loan.date).format("YYYY-MM-DD") : null,
                firstPaymentDate: loan.firstPaymentDate ? moment(loan.firstPaymentDate).format("YYYY-MM-DD") : null,
            };
            const response = await httpCommon.post(`/v1/finance/loan`, transformedLoan)
            this.loans.push(response.data)
            console.log('END - addLoanDb()')
        },
        //
        //UPDATE LOAN
        //
        async updateLoanDb(loan: Loan) {
            console.log('START - updateLoanDb()')
            const response = await httpCommon.put(`/v1/finance/loan`, loan)
            const index = this.loans.findIndex((l: Loan) => l.id === loan.id)
            if (index !== -1) this.loans.splice(index, 1, response.data)
            console.log('END - updateLoanDb()')
        },
        //
        //DELETE LOAN
        //
        async deleteLoanDb(loanId: number) {
            console.log('START - deleteLoanDb()')
            await httpCommon.delete(`/v1/finance/loan/` + loanId)
            const index = this.loans.findIndex((l: Loan) => l.id === loanId)
            if (index !== -1) this.loans.splice(index, 1)
            console.log('END - deleteLoanDb()')
            return true
        },

        //
        //UPDATE LOAN_INSTALLMENT (PAYMENT)
        //
        async updateLoanInstallmentDb(installment: LoanInstallment) {
            console.log('START - updateLoanInstallmentDb()')

            const transformedLoanInstallment = {
                ...installment,
                paymentDeadline: installment.paymentDeadline ? moment(installment.paymentDeadline).format("YYYY-MM-DD") : null,
                paymentDate: installment.paymentDate ? moment(installment.paymentDate).format("YYYY-MM-DD") : null,
            };

            const response = await httpCommon.put(`/v1/finance/loan/installment`, transformedLoanInstallment)
            console.log('loan store ', this.loans)
            const loan = this.loans.find((l: Loan) => l.id === installment.idLoan)
            console.log('loan store ', loan)
            if (loan) {
                const index = loan.installmentList.findIndex(
                    (l: LoanInstallment) => l.idLoanInstallment === installment.idLoanInstallment,
                )
                console.log('index ', index)
                if (index !== -1) loan.installmentList.splice(index, 1, response.data)
            }
            console.log('END - updateLoanInstallmentDb()')
            return loan
        }
    },
})
