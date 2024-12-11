import {defineStore} from 'pinia'
import httpCommon from '../config/http-common'
import {ErrorService} from '../service/ErrorService'
import type {Bank} from '../types/Bank'

export const useBanksStore = defineStore('bank', {
    state: () => ({
        loginError: false,
        btnDisabled: false,
        busyIcon: false,
        loadingBanks: false,

        banks: [] as Bank[],
    }),

    //getters = computed
    getters: {
        getSortedBanks: (state) => {
            console.log('getSortedBanks from pinia', state)
            return state.banks.sort((a, b) => a.name.localeCompare(b.name))
        },
    },

    //actions = metody w komponentach
    actions: {
        getBank(idBank: number): Bank | null {
            const bank = this.banks.find((bank: Bank) => bank.id === idBank)
            if (bank) return bank
            else return null
        },
        /////////////////////////////////////////////DATABASE//////////////////////////
        //
        //GET BANKS
        //
        async getBanksFromDb(): Promise<void> {
            console.log('START - getBanksFromDb()')
            this.loadingBanks = true

            try {
                if (this.banks.length === 0) {
                    const response = await httpCommon.get(`/v1/finance/bank`)
                    console.log('getBanksFromDb() - Ilosc[]: ' + response.data.length)
                    this.banks = response.data
                } else {
                    console.log('getBanksFromDb() - BEZ GET')
                }
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getBanksFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
            } finally {
                this.loadingBanks = false
                console.log('END - getBanksFromDb()')
            }
        },
        //
        //GET  BANK FROM DB BY ID
        //
        async getBankFromDb(bankId: number): Promise<Bank | null> {
            console.log('START - getBankFromDb(' + bankId + ')')
            this.loadingBanks = true

            try {
                const response = await httpCommon.get(`/v1/finance/bank/` + bankId)
                return response.data ? response.data : null
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getBankFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return null
            } finally {
                this.loadingBanks = false
                console.log('END - getBanksFromDb()')
            }
        },
        //
        //ADD Bank
        //
        async addBankDb(bank: Bank) {
            console.log('START - addBankDb()')
            try {
                const response = await httpCommon.post(`/v1/finance/bank`, bank)
                this.banks.push(response.data)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getBankFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - addBankDb()')
            }
        },
        //
        //UPDATE BANK
        //
        async updateBankDb(bank: Bank) {
            console.log('START - updateBankDb()')

            try {
                const response = await httpCommon.put(`/v1/finance/bank`, bank)
                const index = this.banks.findIndex((b: Bank) => b.id === bank.id)
                if (index !== -1) this.banks.splice(index, 1, response.data)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR updateBankDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - updateBankDb()')
            }
        },
        //
        //DELETE Bank
        //
        async deleteBankDb(bankId: number) {
            console.log('START - deleteBankDb()')
            try {
                await httpCommon.delete(`/v1/finance/bank/` + bankId)
                const index = this.banks.findIndex((b: Bank) => b.id === bankId)
                if (index !== -1) this.banks.splice(index, 1)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR deleteBankDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - deleteBankDb()')
            }
        },
    },
})
