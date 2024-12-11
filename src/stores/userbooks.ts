import { defineStore } from 'pinia'
import httpCommon from '../config/http-common'
import { ErrorService } from '../service/ErrorService'
import type { EditionType, OwnershipStatus, ReadingStatus, UserBook } from '../types/Book'
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
      return state.userbooks.filter((ub:UserBook) => ub.readingStatus.name === 'READ_NOW')
    },
    getBooksToRead: (state) => {
      return state.userbooks.filter((ub:UserBook) => ub.readingStatus.name === 'NOT_READ')
    },
  },

  //actions = metody w komponentach
  actions: {
    //
    //GET USERBOOKS
    //
    getUserbooksByDate(year: number) {
      return this.userbooks
        .filter((ub:UserBook) => ub.readingStatus.name === 'READ')
        .filter((ub:UserBook) => {
          if (ub.readTo instanceof Date) {
            return moment(ub.readTo).year() === year;
          }
          return false; // Jeśli nie jest Date, filtr pomija ten element
        })
    },
    async getUserbooksFromDb(): Promise<void> {
      console.log('START - getUserbooksFromDb()')
      this.loadingUserbooks = true

      try {
        const response = await httpCommon.get(`/v1/library/userbook`)
        console.log('getUserbooksFromDb() - Ilosc[]: ' + response.data.length)
        this.userbooks = response.data
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR getUserbooksFromDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
      } finally {
        this.loadingUserbooks = false
        console.log('END - getUserbooksFromDb()')
      }
    },
    //
    //GET USERBOOKS BY STATUS
    //
    async getUserbooksByStatusFromDb(status: ReadingStatus): Promise<void> {
      console.log('START - getUserbooksFromDb()')
      this.loadingUserbooks = true

      try {
        const response = await httpCommon.get(`/v1/library/userbook/status?status=` + status.name)
        console.log('getBanksFromDb() - Ilosc[]: ' + response.data.length)
        this.userbooks = response.data
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR getUserbooksFromDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
      } finally {
        this.loadingUserbooks = false
        console.log('END - getUserbooksFromDb()')
      }
    },
    //
    //GET  USERBOOK FROM DB BY ID
    //
    async getUserbookFromDb(userbookId: number): Promise<UserBook | undefined> {
      console.log('START - getUserbookFromDb(' + userbookId + ')')
      this.loadingUserbooks = true

      try {
        const response = await httpCommon.get(`/v1/library/userbook/` + userbookId)
        return response.data
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR getUserbookFromDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
      } finally {
        this.loadingUserbooks = false
        console.log('END - getUserbookFromDb()')
      }
    },
    //
    //GET  USERBOOK FROM DB BY ID
    //
    async getUserbooksByBookIdFromDb(bookId: number): Promise<UserBook[] | undefined> {
      console.log('START - getUserbookFromDb(' + bookId + ')')
      this.loadingUserbooks = true
      try {
        const response = await httpCommon.get(`/v1/library/userbook/check?id=` + bookId)
        return response.data
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR getUserbooksByBookIdFromDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
      } finally {
        this.loadingUserbooks = false
        console.log('END - getUserbooksByBookIdFromDb()')
      }
    },

    //
    //ADD USERBOOK
    //
    async addUserbookDb(userbook: UserBook) {
      console.log('START - addUserbookDb()')
      try {
        const response = await httpCommon.post(`/v1/library/userbook`, userbook)
        this.userbooks.push(response.data)
        return true
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR addUserbookDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
        return false
      } finally {
        console.log('END - addUserbookDb()')
      }
    },
    //
    //UPDATE USERBOOK
    //
    async updateUserbookDb(userbook: UserBook) {
      console.log('START - updateUserbookDb()')

      try {
        const response = await httpCommon.put(`/v1/library/userbook`, userbook)
        const index = this.userbooks.findIndex((ub:UserBook) => ub.id === userbook.id)
        if (index !== -1) this.userbooks.splice(index, 1, response.data)
        return true
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR updateUserbookDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
        return false
      } finally {
        console.log('END - updateUserbookDb()')
      }
    },
    //
    //DELETE USERBOOK
    //
    async deleteUserbookDb(userbookId: number) {
      console.log('START - deleteUserbookDb()')
      try {
        await httpCommon.delete(`/v1/library/userbook/` + userbookId)
        const index = this.userbooks.findIndex((b:UserBook) => b.id === userbookId)
        if (index !== -1) this.userbooks.splice(index, 1)
        return true
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR deleteUserbookDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
        return false
      } finally {
        console.log('END - deleteUserbookDb()')
      }
    },

    //
    //GET OWNERSHIP  FROM DB
    //
    async getOwnershipFromDb(): Promise<void> {
      console.log('START - getOwnershipFromDb()')
      this.loadingOwnership = true

      try {
        const response = await httpCommon.get(`/v1/library/userbook/ownership_status`)
        this.ownershipStatus = response.data
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR getOwnershipFromDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
      } finally {
        this.loadingOwnership = false
        console.log('END - getOwnershipFromDb()')
      }
    },

    //
    //GET EDITION TYPE FROM DB
    //
    async getEditionTypeFromDb(): Promise<void> {
      console.log('START - getEditionTypeFromDb()')
      this.loadingEditionType = true

      try {
        const response = await httpCommon.get(`/v1/library/userbook/edition_type`)
        this.editionTypes = response.data
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR getEditionTypeFromDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
      } finally {
        this.loadingEditionType = false
        console.log('END - getEditionTypeFromDb()')
      }
    },

    //
    //GET READING STATUS FROM DB
    //
    async getReadingStatusFromDb(): Promise<void> {
      console.log('START - getReadingStatusFromDb()')
      this.loadingReadingStatus = true

      try {
        const response = await httpCommon.get(`/v1/library/userbook/reading_status`)
        this.readingStatuses = response.data
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log('ERROR getReadingStatusFromDb(): ', e)
          ErrorService.validateError(e)
        } else {
          console.log('An unexpected error occurred: ', e)
        }
      } finally {
        this.loadingReadingStatus = false
        console.log('END - getReadingStatusFromDb()')
      }
    },
  },
})
