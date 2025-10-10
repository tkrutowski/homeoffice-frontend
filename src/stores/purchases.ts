import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { PaymentStatus } from '@/types/Payment';
import type { Purchase } from '@/types/Purchase';
import moment from 'moment';

export const usePurchasesStore = defineStore('purchase', {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingPurchases: false,
    loadingPurchasesCurrent: false,

    purchasesToPay: [] as Purchase[],
    purchases: [] as Purchase[],
    totalPurchases: 0,
    currentPage: 0,
    sumToPay: 0, // suma zakupów do zapłaty pobierana z bazy
    rowsPerPage: parseInt(localStorage.getItem('rowsPerPagePurchases') || '10'),

    // purchases: new Map<string, Purchase[]>(),
    purchasesCurrent: new Map<string, Purchase[]>(),
    sortField: 'id',
    sortOrder: -1, // 1 = ASC, -1 = DESC - domyślnie sortujemy po ID malejąco
    filters: {} as any,
  }),

  //getters = computed
  getters: {
    totalAmount: state => {
      let total = 0;
      state.purchasesCurrent.forEach(purchases => {
        purchases.forEach((purchase: Purchase) => {
          total += Number(purchase.amount); // Zakładając, że 'kwota' to pole w obiekcie 'Purchase'
        });
      });
      return total;
    },
    totalAmountToPay: state => {
      let total = 0;
      state.purchasesToPay.forEach((purchase: Purchase) => {
        total += Number(purchase.amount); // Zakładając, że 'kwota' to pole w obiekcie 'Purchase'
      });
      return total;
    },
  },

  //actions = metody w komponentach
  actions: {
    clearPurchasesToPay() {
      this.purchasesToPay = [];
    },
    //add Purchase to the list ready to pay
    addPurchaseToPay(purchase: Purchase) {
      this.purchasesToPay.push(purchase);
    },
    //remove Purchase from the list ready to pay
    delPurchaseToPay(purchase: Purchase) {
      const index = this.purchasesToPay.findIndex((value: Purchase) => value.id === purchase.id);
      if (index !== -1) this.purchasesToPay.splice(index, 1);
    },
    getPurchasesByDate(date: string) {
      return this.purchasesCurrent.get(date);
    },
    //
    //GET PURCHASE BY ID
    //
    getPurchaseById(searchId: number) {
      for (const [, purchases] of this.purchasesCurrent.entries()) {
        for (const purchase of purchases) {
          if (purchase.id === searchId) {
            return purchase;
          }
        }
      }
      return null; // Jeśli nie znaleziono Purchase o danym id
    },

    //--------------------------------------------------DATABASE----------------------------------------------
    //
    //GET CURRENT PURCHASES FROM DB
    //
    async getPurchaseCurrentFromDb(username: string) {
      console.log(`START - getPurchaseCurrentFromDb(${username})`);
      this.loadingPurchasesCurrent = true;

      const response = await httpCommon.get(`/v1/finance/purchase/current/${username}`);
      console.log('getPurchaseCurrentFromDb() - Ilosc[]: ' + response.data);
      const purchasesTemp = new Map(Object.entries(response.data));
      this.purchasesCurrent = purchasesTemp as Map<string, Purchase[]>;
      this.loadingPurchasesCurrent = false;
      console.log('END - getPurchaseCurrentFromDb()');
      return this.purchasesCurrent;
    },
    //
    //GET  PURCHASE FROM DB BY ID
    //
    async getPurchaseFromDb(purchaseId: number): Promise<Purchase | null> {
      console.log('START - getPurchaseFromDb(' + purchaseId + ')');
      this.loadingPurchases = true;

      const response = await httpCommon.get(`/v1/finance/purchase/` + purchaseId);
      this.loadingPurchases = false;
      console.log('END - getPurchaseFromDb()');
      if (response.data) return response.data;
      else return null;
    },
    //
    //ADD PURCHASE
    //
    async addPurchaseDb(purchase: Purchase) {
      console.log('START - addPurchaseDb()', purchase);
      const transformedPurchase = {
        ...purchase,
        purchaseDate: purchase.purchaseDate ? moment(purchase.purchaseDate).format('YYYY-MM-DD') : null,
        paymentDeadline: purchase.paymentDeadline ? moment(purchase.paymentDeadline).format('YYYY-MM-DD') : null,
        paymentDate: purchase.paymentDate ? moment(purchase.paymentDate).format('YYYY-MM-DD') : null,
      };

      const response = await httpCommon.post(`/v1/finance/purchase`, transformedPurchase);
      //TODO sprawdzić czy można dodać bezpośrednio do tablicy
      const res: Purchase = response.data;

      // const paymentDeadline = res.paymentDeadline && res.paymentDeadline instanceof Date ? moment(res.paymentDeadline).format('YYYY-MM-DD') : '0001-01-01'
      const paymentDeadline = res.paymentDeadline ? moment(res.paymentDeadline).format('YYYY-MM-DD') : '0001-01-01';

      // Logika dodawania zakupu do purchasesCurrent
      let shouldAddToCurrent = false;

      // Sprawdzamy czy purchasesCurrent jest puste
      if (this.purchasesCurrent.size === 0) {
        shouldAddToCurrent = true;
      } else {
        // Sprawdzamy czy purchasesCurrent zawiera zakupy tego samego użytkownika
        let existingUserId: number | null = null;
        
        // Pobieramy pierwszego użytkownika z purchasesCurrent
        for (const [, purchases] of this.purchasesCurrent.entries()) {
          if (purchases.length > 0) {
            existingUserId = purchases[0].idUser;
            break;
          }
        }

        // Jeśli znaleziono istniejące zakupy i użytkownik się zgadza - dodaj
        if (existingUserId !== null && existingUserId === res.idUser) {
          shouldAddToCurrent = true;
        }
      }

      if (shouldAddToCurrent) {
        if (this.purchasesCurrent.has(paymentDeadline)) {
          const purchaseArray = this.purchasesCurrent.get(paymentDeadline);
          if (purchaseArray) {
            purchaseArray.push(res);
            this.purchasesCurrent.set(paymentDeadline, purchaseArray);
          }
        } else {
          this.purchasesCurrent.set(paymentDeadline, new Array(res));
        }
        console.log('Zakup dodany do purchasesCurrent dla użytkownika:', res.idUser);
      } else {
        console.log('Zakup NIE został dodany do purchasesCurrent (inny użytkownik)');
      }
      
      console.log('END - addPurchaseDb()');
    },
    //
    //PAY FOR PURCHASE
    //
    async payForPurchaseDb(purchaseId: number, status: PaymentStatus) {
      console.log('START - payForPurchaseDb()');

      await httpCommon.put(`/v1/finance/purchase/status/` + purchaseId, {
        value: status,
      });

      for (const [deadline, purchases] of this.purchasesCurrent.entries()) {
        const index = purchases.findIndex((purchase: Purchase) => purchase.id === purchaseId);

        console.log('rozmier przed ', purchases.length);
        if (index !== -1) {
          purchases.splice(index, 1);
          console.log(`Usunięto zakup o id ${purchaseId} dla deadline ${deadline}`);
          console.log('rozmier po ', purchases.length);
          if (purchases.length === 0) this.purchasesCurrent.delete(deadline);
          return true;
        }
      }
      return false;
    },
    //
    //REFRESH PURCHASES
    //
    async refreshPurchases() {
      console.log('START - refreshPurchases()');
      await this.getPurchasesFromDb(this.currentPage);
      await this.getPurchasesSumToPayFromDb();
      console.log('END - refreshPurchases()');
    },
    //
    //LOAD PAGE
    //
    async loadPage(page: number, rows?: number) {
      if (rows !== undefined) {
        this.rowsPerPage = rows;
        localStorage.setItem('rowsPerPagePurchases', rows.toString());
      }
      await this.getPurchasesFromDb(page);
    },
    //
    //SORT PURCHASES
    //
    async sortPurchases(sortField: string, sortOrder: number) {
      console.log('sortPurchases()', sortField, sortOrder);
      this.sortField = sortField;
      this.sortOrder = sortOrder;
      await this.loadPage(0); // Reset to first page after sort
    },
    //
    //FILTER PURCHASES
    //
    async filterPurchases(filters: any) {
      console.log('filterPurchases()', filters);
      this.filters = filters;
      await this.loadPage(0); // Reset to first page after filter
    },
    //
    //GET ALL PURCHASES FROM DB
    //
    async getPurchasesFromDb(page: number = 0, size?: number): Promise<void> {
      const pageSize = size || this.rowsPerPage;
      console.log(`START - getPurchasesFromDb(page: ${page}, size: ${pageSize})`);
      this.loadingPurchases = true;

      // parameters
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sort: this.sortField,
        direction: this.sortOrder > 0 ? 'ASC' : 'DESC',
      });

      // filters
      if (this.filters.global?.value) {
        params.append('globalFilter', this.filters.global.value);
      }
      if (this.filters.idUser?.value) {
        params.append('username', this.filters.idUser.value.username);
      }
      if (this.filters.name?.value) {
        params.append('name', this.filters.name.value);
      }
      if (this.filters.purchaseDate?.constraints?.[0]?.value) {
        const date = new Date(this.filters.purchaseDate.constraints[0].value);
        // Use local date methods to avoid timezone conversion issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        params.append('purchaseDate', `${year}-${month}-${day}`);

        // Map PrimeVue FilterMatchMode to backend dateComparisonType
        const matchMode = this.filters.purchaseDate.constraints[0].matchMode;
        let dateComparisonType = 'EQUALS'; // default

        if (matchMode === 'dateIs') {
          dateComparisonType = 'EQUALS';
        } else if (matchMode === 'dateBefore') {
          dateComparisonType = 'BEFORE';
        } else if (matchMode === 'dateAfter') {
          dateComparisonType = 'AFTER';
        }

        params.append('dateComparisonType', dateComparisonType);
      }
      if (this.filters.idFirm?.value) {
        params.append('firmId', this.filters.idFirm.value.toString());
      }
      if (this.filters.paymentStatus?.value) {
        params.append('status', this.filters.paymentStatus.value);
      }
      const response = await httpCommon.get(`/v1/finance/purchase/page?${params.toString()}`);
      console.log('getPurchasesFromDb() - Ilość[]: ' + response.data.content.length);
      this.purchases = response.data.content;
      this.totalPurchases = response.data.totalElements;
      this.currentPage = response.data.number;
      this.loadingPurchases = false;
      console.log('END - getPurchasesFromDb()');
    },
    //
    //GET SUM TO PAY FROM DB
    //
    async getPurchasesSumToPayFromDb(): Promise<number> {
      console.log('START - getPurchasesSumToPayFromDb()');

      const response = await httpCommon.get(`/v1/finance/purchase/sum/to-pay`);
      this.sumToPay = response.data;

      console.log('END - getPurchasesSumToPayFromDb(), suma:', this.sumToPay);
      return this.sumToPay;
    },
    //
    //UPDATE PURCHASE
    //
    async updatePurchaseDb(purchase: Purchase) {
      console.log('START - updatePurchaseDb()', purchase);
      const transformedPurchase = {
        ...purchase,
        purchaseDate: purchase.purchaseDate ? moment(purchase.purchaseDate).format('YYYY-MM-DD') : null,
        paymentDeadline: purchase.paymentDeadline ? moment(purchase.paymentDeadline).format('YYYY-MM-DD') : null,
        paymentDate: purchase.paymentDate ? moment(purchase.paymentDate).format('YYYY-MM-DD') : null,
      };

      const response = await httpCommon.put(`/v1/finance/purchase`, transformedPurchase);

      // Aktualizacja w lokalnej tablicy purchases
      const index = this.purchases.findIndex((p: Purchase) => p.id === purchase.id);
      if (index !== -1) {
        this.purchases[index] = response.data;
      }

      // Aktualizacja w purchasesCurrent jeśli istnieje
      for (const [, purchases] of this.purchasesCurrent.entries()) {
        const currentIndex = purchases.findIndex((p: Purchase) => p.id === purchase.id);
        if (currentIndex !== -1) {
          purchases[currentIndex] = response.data;
          break;
        }
      }

      console.log('END - updatePurchaseDb()');
    },
    //
    //UPDATE PURCHASE STATUS
    //
    async updatePurchaseStatusDb(purchaseId: number, status: PaymentStatus) {
      console.log('START - updatePurchaseStatusDb()');

      await httpCommon.put(`/v1/finance/purchase/status/` + purchaseId, {
        value: status,
      });

      const purchase = this.purchases.find((p: Purchase) => p.id === purchaseId);
      if (purchase) {
        purchase.paymentStatus = status;
      }
      console.log('END - updatePurchaseStatusDb()');
    },
    //
    //DELETE PURCHASE
    //
    async deletePurchaseDb(purchaseId: number) {
      console.log('START - deletePurchaseDb()');

      await httpCommon.delete(`/v1/finance/purchase/` + purchaseId);

      const index = this.purchases.findIndex((purchase: Purchase) => purchase.id === purchaseId);
      if (index !== -1) {
        this.purchases.splice(index, 1);
      }
      console.log('END - deletePurchaseDb()');
    },
  },
});
