import {defineStore} from 'pinia'
import httpCommon from '@/config/http-common'
import type {EditionType, OwnershipStatus, ReadingStatus, UserBook} from '@/types/Book'
import moment from 'moment'

export const useUserbooksStore = defineStore('userbook', {
    state: () => ({
        loginError: false,
        btnDisabled: false,
        busyIcon: false,
        loadingUserbooks: false,
        loadingOwnership: false,
        loadingEditionType: false,
        loadingReadingStatus: false,
        readSelectedYear: new Date().getFullYear(),
        userbooks: [] as UserBook[],
        ownershipStatus: [] as OwnershipStatus[],
        editionTypes: [] as EditionType[],
        readingStatuses: [] as ReadingStatus[],
    }),

    //getters = computed
    getters: {
        // getSortedInvoices: (state) =>
        //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
        getBooksReadNow: (state) => {
            return state.userbooks.filter((ub: UserBook) => ub.readingStatus === 'READ_NOW')
        },
        getBooksToRead: (state) => {
            return state.userbooks.filter((ub: UserBook) => ub.readingStatus === 'NOT_READ')
        },
    },

    //actions = metody w komponentach
    actions: {
        //
        //GET USERBOOKS
        //
        getUserbooksByDate(year: number) {
            console.log('START - getUserbooksByDate()', year)
            return this.userbooks
                .filter((ub: UserBook) => ub.readingStatus === 'READ')
                .filter((ub: UserBook) => {
                        return moment(ub.readTo).year() === year;
                })
        },
        async getUserbooksFromDb(): Promise<void> {
            console.log('START - getUserbooksFromDb()')
            this.loadingUserbooks = true

            const response = await httpCommon.get(`/v1/library/userbook`)
            console.log('getUserbooksFromDb() - Ilosc[]: ' + response.data.length)
            this.userbooks = response.data
            this.loadingUserbooks = false
            console.log('END - getUserbooksFromDb()')
        },
        //
        //GET USERBOOKS BY STATUS
        //
        async getUserbooksByStatusFromDb(status: ReadingStatus): Promise<void> {
            console.log('START - getUserbooksFromDb()')
            this.loadingUserbooks = true

            const response = await httpCommon.get(`/v1/library/userbook/status?status=` + status)
            console.log('getBanksFromDb() - Ilosc[]: ' + response.data.length)
            this.userbooks = response.data
            this.loadingUserbooks = false
            console.log('END - getUserbooksFromDb()')
        },
        //
        //GET  USERBOOK FROM DB BY ID
        //
        async getUserbookFromDb(userbookId: number): Promise<UserBook | null> {
            console.log('START - getUserbookFromDb(' + userbookId + ')')
            this.loadingUserbooks = true

            const response = await httpCommon.get(`/v1/library/userbook/` + userbookId)
            this.loadingUserbooks = false
            console.log('END - getUserbookFromDb()')
            if (response.data)
                return response.data
            else
                return null
        },
        //
        //GET  USERBOOK FROM DB BY ID
        //
        async getUserbooksByBookIdFromDb(bookId: number): Promise<UserBook[] | null> {
            console.log('START - getUserbookFromDb(' + bookId + ')')
            this.loadingUserbooks = true
            const response = await httpCommon.get(`/v1/library/userbook/check?id=` + bookId)
            this.loadingUserbooks = false
            console.log('END - getUserbooksByBookIdFromDb()')
            return  response.data ?response.data :  null
        },

        //
        //ADD USERBOOK
        //
        async addUserbookDb(userbook: UserBook) {
            console.log('START - addUserbookDb()')
            const transformedUserBook = {
                ...userbook,
                readFrom: userbook.readFrom ? moment(userbook.readFrom).format("YYYY-MM-DD") : null,
                readTo: userbook.readTo ? moment(userbook.readTo).format("YYYY-MM-DD") : null,
            };
            const response = await httpCommon.post(`/v1/library/userbook`, transformedUserBook)
            this.userbooks.push(response.data)
            console.log('END - addUserbookDb()')
        },
        //
        //UPDATE USERBOOK
        //
        async updateUserbookDb(userbook: UserBook) {
            console.log('START - updateUserbookDb()')
            const transformedUserBook = {
                ...userbook,
                readFrom: userbook.readFrom ? moment(userbook.readFrom).format("YYYY-MM-DD") : null,
                readTo: userbook.readTo ? moment(userbook.readTo).format("YYYY-MM-DD") : null,
            };
            const response = await httpCommon.put(`/v1/library/userbook`, transformedUserBook)
            const index = this.userbooks.findIndex((ub: UserBook) => ub.id === userbook.id)
            if (index !== -1) this.userbooks.splice(index, 1, response.data)
            console.log('END - updateUserbookDb()')
        },
        //
        //DELETE USERBOOK
        //
        async deleteUserbookDb(userbookId: number) {
            console.log('START - deleteUserbookDb()')
            await httpCommon.delete(`/v1/library/userbook/` + userbookId)
            const index = this.userbooks.findIndex((b: UserBook) => b.id === userbookId)
            if (index !== -1) this.userbooks.splice(index, 1)
            console.log('END - deleteUserbookDb()')
        },

        //
        //GET OWNERSHIP  FROM DB
        //
        async getOwnershipFromDb(): Promise<void> {
            console.log('START - getOwnershipFromDb()')
            this.loadingOwnership = true

            const response = await httpCommon.get(`/v1/library/userbook/ownership_status`)
            this.ownershipStatus = response.data
            this.loadingOwnership = false
            console.log('END - getOwnershipFromDb()')
        },

        //
        //GET EDITION TYPE FROM DB
        //
        async getEditionTypeFromDb(): Promise<void> {
            console.log('START - getEditionTypeFromDb()')
            this.loadingEditionType = true

            const response = await httpCommon.get(`/v1/library/userbook/edition_type`)
            this.editionTypes = response.data
            this.loadingEditionType = false
            console.log('END - getEditionTypeFromDb()')
        },

        //
        //GET READING STATUS FROM DB
        //
        async getReadingStatusFromDb(): Promise<void> {
            console.log('START - getReadingStatusFromDb()')
            this.loadingReadingStatus = true

            const response = await httpCommon.get(`/v1/library/userbook/reading_status`)
            this.readingStatuses = response.data
            this.loadingReadingStatus = false
            console.log('END - getReadingStatusFromDb()')
        },
    },
})
