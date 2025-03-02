import {defineStore} from 'pinia'
import httpCommon from '@/config/http-common'
import type {PaymentStatus} from '@/types/Payment'
import type {Purchase} from '@/types/Purchase'
import moment from 'moment'

export const usePurchasesStore = defineStore('purchase', {
    state: () => ({
        loginError: false,
        btnDisabled: false,
        busyIcon: false,
        loadingPurchases: false,

        purchasesToPay: [] as Purchase[],

        // purchases: new Map<string, Purchase[]>(),
        purchases: new Map<string, Purchase[]>(),
    }),

    //getters = computed
    getters: {
        totalAmount: (state) => {
            let total = 0
            state.purchases.forEach((purchases) => {
                purchases.forEach((purchase: Purchase) => {
                    total += Number(purchase.amount) // Zakładając, że 'kwota' to pole w obiekcie 'Purchase'
                })
            })
            return total
        },
        totalAmountToPay: (state) => {
            let total = 0
            state.purchasesToPay.forEach((purchase: Purchase) => {
                total += Number(purchase.amount) // Zakładając, że 'kwota' to pole w obiekcie 'Purchase'
            })
            return total
        },
        // getSortedInvoices: (state) =>
        //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
    },

    //actions = metody w komponentach
    actions: {
        clearPurchasesToPay() {
            this.purchasesToPay = []
        },
        //add Purchase to the list ready to pay
        addPurchaseToPay(purchase: Purchase) {
            this.purchasesToPay.push(purchase)
        },
        //remove Purchase from the list ready to pay
        delPurchaseToPay(purchase: Purchase) {
            const index = this.purchasesToPay.findIndex((value: Purchase) => value.id === purchase.id)
            if (index !== -1) this.purchasesToPay.splice(index, 1)
        },
        getPurchasesByDate(date: string) {
            return this.purchases.get(date)
        },
        //
        //GET PURCHASE BY ID
        //
        getPurchaseById(searchId: number) {
            for (const [, purchases] of this.purchases.entries()) {
                for (const purchase of purchases) {
                    if (purchase.id === searchId) {
                        return purchase
                    }
                }
            }
            return null // Jeśli nie znaleziono Purchase o danym id
        },

        //--------------------------------------------------DATABASE----------------------------------------------
        //
        //GET CURRENT PURCHASES FROM DB
        //
        async getPurchaseCurrentFromDb(): Promise<void> {
            console.log('START - getPurchaseCurrentFromDb()')
            this.loadingPurchases = true

            const response = await httpCommon.get(`/v1/finance/purchase/current`)
            console.log('getPurchaseCurrentFromDb() - Ilosc[]: ' + response.data)
            const purchasesTemp = new Map(Object.entries(response.data))
            this.purchases = purchasesTemp as Map<string, Purchase[]>
            this.loadingPurchases = false
            console.log('END - getPurchaseCurrentFromDb()')
        },
        //
        //GET  PURCHASE FROM DB BY ID
        //
        async getPurchaseFromDb(purchaseId: number): Promise<Purchase | null> {
            console.log('START - getPurchaseFromDb(' + purchaseId + ')')
            this.loadingPurchases = true

            const response = await httpCommon.get(`/v1/finance/purchase/` + purchaseId)
            this.loadingPurchases = false
            console.log('END - getPurchaseFromDb()')
            if (response.data)
                return response.data
            else
                return null
        },
        //
        //ADD PURCHASE
        //
        async addPurchaseDb(purchase: Purchase) {
            console.log("START - addPurchaseDb()", purchase);
            const transformedPurchase = {
                ...purchase,
                purchaseDate: purchase.purchaseDate ? moment(purchase.purchaseDate).format("YYYY-MM-DD") : null,
                paymentDeadline: purchase.paymentDeadline ? moment(purchase.paymentDeadline).format("YYYY-MM-DD") : null,
                paymentDate: purchase.paymentDate ? moment(purchase.paymentDate).format("YYYY-MM-DD") : null,
            };

            const response = await httpCommon.post(`/v1/finance/purchase`, transformedPurchase)
            //TODO sprawdzić czy można dodać bezpośrednio do tablicy
            const res: Purchase = response.data

            // const paymentDeadline = res.paymentDeadline && res.paymentDeadline instanceof Date ? moment(res.paymentDeadline).format('YYYY-MM-DD') : '0001-01-01'
            const paymentDeadline = res.paymentDeadline ? moment(res.paymentDeadline).format('YYYY-MM-DD') : '0001-01-01'

            if (this.purchases.has(paymentDeadline)) {
                const purchaseArray = this.purchases.get(paymentDeadline)
                if (purchaseArray) {
                    purchaseArray.push(res)
                    this.purchases.set(paymentDeadline, purchaseArray)
                }
            } else {
                this.purchases.set(paymentDeadline, new Array(res))
            }
            console.log('END - addPurchaseDb()')
        },
        //
        //PAY FOR PURCHASE
        //
        async payForPurchaseDb(purchaseId: number, status: PaymentStatus) {
            console.log('START - payForPurchaseDb()')

                await httpCommon.put(`/v1/finance/purchase/status/` + purchaseId, {value: status})

                for (const [deadline, purchases] of this.purchases.entries()) {
                    const index = purchases.findIndex((purchase: Purchase) => purchase.id === purchaseId)

                    console.log('rozmier przed ', purchases.length)
                    if (index !== -1) {
                        purchases.splice(index, 1)
                        console.log(`Usunięto zakup o id ${purchaseId} dla deadline ${deadline}`)
                        console.log('rozmier po ', purchases.length)
                        if (purchases.length === 0) this.purchases.delete(deadline)
                        return true
                    }
                }
                return false
        },
    },
})
