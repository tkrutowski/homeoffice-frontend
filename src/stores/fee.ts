import {defineStore} from 'pinia'
import httpCommon from '../config/http-common'
import type {PaymentStatus} from '../types/PaymentStatus'
import {ErrorService} from '../service/ErrorService'
import type {Fee, FeeFrequency, FeeInstallment} from '../types/Fee'
import type {StatusType} from '../types/StatusType'

export const useFeeStore = defineStore('fee', {
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
            return state.fees.filter((item: Fee) => item.feeStatus.name === 'PAID')
        },
        getFeesToPay: (state) => {
            return state.fees.filter((item: Fee) => item.feeStatus.name === 'TO_PAY')
        },
    },

    //actions = metody w komponentach
    actions: {
        //
        //REFRESH FEES
        //
        async refreshLoans() {
            await this.getFeesFromDb('ALL', true)
        },
        //
        //GET FEES FROM DB BY PAYMENT_STATUS
        //
        async getFees(status: StatusType) {
            console.log('START - getFees(' + status + ')')

            if (this.fees.length === 0) {
                await this.getFeesFromDb('ALL', true)
            }
            console.log('END - getFees(' + status + ')')
            switch (status) {
                case 'TO_PAY':
                    return this.fees.filter((item: Fee) => item.feeStatus.name === 'TO_PAY')
                case 'PAID':
                    return this.fees.filter((item: Fee) => item.feeStatus.name === 'PAID')
                case 'ALL':
                default:
                    return this.fees
            }
        },
        getFee(idFee: number) {
            return this.fees.find((item) => item.id === idFee)
        },
        //----------------------------------------------DATABASE--------------------------------------------
        //
        //GET FEES FROM DB BY PAYMENT_STATUS
        //
        async getFeesFromDb(paymentStatus: string, installment: boolean): Promise<void> {
            console.log('START - getFeesFromDb(' + paymentStatus + ', ' + installment + ')')
            this.loadingFees = true

            try {
                const response = await httpCommon.get(
                    `/v1/finance/fee/status?status=` + paymentStatus + '&installment=' + installment,
                )
                console.log('getFeesFromDb() - Ilosc[]: ' + response.data.length)
                this.fees = response.data
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getFeesFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
            } finally {
                this.loadingFees = false
                console.log('END - getFeesFromDb(' + paymentStatus + ', ' + installment + ')')
            }
        },
        //
        //GET FEE FROM DB BY ID
        //
        async getFeeFromDb(feeId: number): Promise<Fee | null> {
            console.log('START - getFeeFromDb(' + feeId + ')')
            this.loadingFees = true

            try {
                const response = await httpCommon.get(`/v1/finance/fee/` + feeId)
                if (response.data) {
                    return response.data
                } else
                    return null
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getFeeFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return null
            } finally {
                this.loadingFees = false
                console.log('END - getFeesFromDb()')
            }
        },
        //
        //CHANGE PAYMENT_STATUS
        //
        async updateFeeStatusDb(feeId: number, status: PaymentStatus) {
            console.log('START - updateFeeStatusDb()')

            try {
                await httpCommon.put(`/v1/finance/fee/status/` + feeId, {value: status.name})
                const fee = this.fees.find((fee: Fee) => fee.id === feeId)
                if (fee) {
                    fee.feeStatus = status
                }
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR updateFeeStatusDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - updateFeeStatusDb()')
            }
        },
        //
        //ADD Fee
        //
        async addFeeDb(fee: Fee) {
            console.log('START - addFeeDb()')
            try {
                const response = await httpCommon.post(`/v1/finance/fee`, fee)
                this.fees.push(response.data)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR addFeeDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - addFeeDb()')
            }
        },
        //
        //UPDATE FEE
        //
        async updateFeeDb(fee: Fee) {
            console.log('START - updateFeeDb()')

            try {
                const response = await httpCommon.put(`/v1/finance/fee`, fee)
                const index = this.fees.findIndex((f: Fee) => f.id === fee.id)
                if (index !== -1) this.fees.splice(index, 1, response.data)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR updateFeeDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - updateFeeDb()')
            }
        },
        //
        //DELETE FEE
        //
        async deleteFeeDb(feeId: number) {
            console.log('START - deleteFeeDb()')
            try {
                await httpCommon.delete(`/v1/finance/fee/` + feeId)
                const index = this.fees.findIndex((f: Fee) => f.id === feeId)
                if (index !== -1) this.fees.splice(index, 1)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR deleteFeeDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - deleteFeeDb()')
            }
        },
        //
        //GET PAYMENT TYPE
        //
        async getFeeFrequencyType() {
            console.log('START - getFeeFrequencyType()')
            this.loadingFeeFrequencyType = true
            try {
                if (this.feeFrequencyTypes.length === 0) {
                    const response = await httpCommon.get(`/v1/finance/fee/frequency`)
                    this.feeFrequencyTypes = response.data
                } else {
                    console.log('getFeeFrequencyType() - BEZ GET')
                }
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getFeeFrequencyType(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
            } finally {
                this.loadingFeeFrequencyType = false
                console.log('END - getFeeFrequencyType()')
            }
        },
        //
        //UPDATE FEE_INSTALLMENT (PAYMENT)
        //
        async updateFeeInstallmentDb(installment: FeeInstallment) {
            console.log('START - updateFeeInstallmentDb()')

            try {
                const response = await httpCommon.put(`/v1/finance/fee/installment`, installment)
                const fee: Fee | undefined = this.fees.find((fee: Fee) => fee.id === installment.idFee)
                if (fee) {
                    const index = fee.installmentList.findIndex(
                        (f: FeeInstallment) => f.idFeeInstallment === installment.idFeeInstallment,
                    )
                    console.log('index ', index)
                    if (index !== -1) fee.installmentList.splice(index, 1, response.data)
                    return fee
                } else
                    return null

            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR updateFeeInstallmentDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
            } finally {
                console.log('END - updateFeeInstallmentDb()')
            }
        },
    },
})
