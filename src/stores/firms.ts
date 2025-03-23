import {defineStore} from 'pinia'
import httpCommon from '@/config/http-common'
import type {Firm} from '@/types/Firm'

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
            return result || null
        },

        //----------------------------------DATABASE-----------------------
        //
        //GET FIRMS
        //
        async getFirmsFromDb(): Promise<void> {
            console.log('START - getFirmsFromDb()')
            this.loadingFirms = true

            const response = await httpCommon.get(`/v1/finance/firm`)
            console.log('getFirmsFromDb() - Ilosc[]: ' + response.data.length)
            this.firms = response.data.map((firm: any) => this.convertResponse(firm));
            this.loadingFirms = false
            console.log('END - getFirmsFromDb()')
        },
        //
        //GET  FIRM FROM DB BY ID
        //
        async getFirmFromDb(firmId: number): Promise<Firm | null> {
            console.log('START - getFirmFromDb(' + firmId + ')')
            this.loadingFirms = true

            const response = await httpCommon.get(`/v1/finance/firm/` + firmId)
            this.loadingFirms = false
            console.log('END - getFirmFromDb()')
            return this.convertResponse(response.data) || null
        },
        //
        //ADD FIRM
        //
        async addFirmDb(firm: Firm) {
            console.log('START - addFirmDb()')
            const response = await httpCommon.post(`/v1/finance/firm`, firm)
            this.firms.push(response.data)
            console.log('END - addFirmDb()')
        },
        //
        //UPDATE FIRM
        //
        async updateFirmDb(firm: Firm) {
            console.log('START - updateFirmDb()')

            const response = await httpCommon.put(`/v1/finance/firm`, firm)
            const index = this.firms.findIndex((f: Firm) => f.id === firm.id)
            if (index !== -1) this.firms.splice(index, 1, response.data)
            console.log('END - updateFirmDb()')
        },
        //
        //DELETE FIRM
        //
        async deleteFirmDb(firmId: number) {
            console.log('START - deleteFirmDb()')
            await httpCommon.delete(`/v1/finance/firm/` + firmId)
            const index = this.firms.findIndex((f: Firm) => f.id === firmId)
            if (index !== -1) this.firms.splice(index, 1)
            console.log('END - deleteFirmDb()')
        },

        convertResponse(firm: Firm) {
            return {
                ...firm,
                address: firm.address ? firm.address : {id: 0, city: '', street: '', zip: ''},
            }
        }
    },
})
