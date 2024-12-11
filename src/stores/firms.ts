import {defineStore} from 'pinia'
import httpCommon from '../config/http-common'
import {ErrorService} from '../service/ErrorService'
import type {Firm} from '../types/Firm'

export const useFirmsStore = defineStore('firm', {
    state: () => ({
        loginError: false,
        btnDisabled: false,
        busyIcon: false,
        loadingFirms: false,

        firms: [] as Firm[],
    }),

    //getters = computed
    getters: {
        // getSortedInvoices: (state) =>
        //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
    },

    //actions = metody w komponentach
    actions: {
        //
        //GET FIRM BY ID
        //
        getFirm(id: number): Firm | null {
            // console.log("GET_FIRM id:", id);
            const result = this.firms.find((firm) => firm.id === id)
            // console.log("GET_FIRM bez:", result);
            if (result) return result

            return null
        },

        //----------------------------------DATABASE-----------------------
        //
        //GET FIRMS
        //
        async getFirmsFromDb(): Promise<void> {
            console.log('START - getFirmsFromDb()')
            this.loadingFirms = true

            try {
                const response = await httpCommon.get(`/v1/finance/firm`)
                console.log('getFirmsFromDb() - Ilosc[]: ' + response.data.length)
                this.firms = response.data
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getFirmsFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
            } finally {
                this.loadingFirms = false
                console.log('END - getFirmsFromDb()')
            }
        },
        //
        //GET  FIRM FROM DB BY ID
        //
        async getFirmFromDb(firmId: number): Promise<Firm | null> {
            console.log('START - getFirmFromDb(' + firmId + ')')
            this.loadingFirms = true

            try {
                const response = await httpCommon.get(`/v1/finance/firm/` + firmId)
                if (response.data)
                    return response.data
                else
                    return null
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR getFirmFromDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return null
            } finally {
                this.loadingFirms = false
                console.log('END - getFirmFromDb()')
            }
        },
        //
        //ADD FIRM
        //
        async addFirmDb(firm: Firm) {
            console.log('START - addBankDb()')
            try {
                const response = await httpCommon.post(`/v1/finance/firm`, firm)
                this.firms.push(response.data)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR addFirmDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - addFirmDb()')
            }
        },
        //
        //UPDATE FIRM
        //
        async updateFirmDb(firm: Firm) {
            console.log('START - updateBankDb()')

            try {
                const response = await httpCommon.put(`/v1/finance/firm`, firm)
                const index = this.firms.findIndex((f: Firm) => f.id === firm.id)
                if (index !== -1) this.firms.splice(index, 1, response.data)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR updateFirmDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - updateFirmDb()')
            }
        },
        //
        //DELETE FIRM
        //
        async deleteFirmDb(firmId: number) {
            console.log('START - deleteFirmDb()')
            try {
                await httpCommon.delete(`/v1/finance/firm/` + firmId)
                const index = this.firms.findIndex((f: Firm) => f.id === firmId)
                if (index !== -1) this.firms.splice(index, 1)
                return true
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log('ERROR deleteFirmDb(): ', e)
                    ErrorService.validateError(e)
                } else {
                    console.log('An unexpected error occurred: ', e)
                }
                return false
            } finally {
                console.log('END - deleteFirmDb()')
            }
        },
    },
})
