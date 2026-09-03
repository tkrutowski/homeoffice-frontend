/**
 * Composable do zarządzania danymi i stanem wykresów w Finance Home
 * Obsługuje agregację danych, ładowanie i aktualizację map z danymi
 */

import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { GenericChartData } from '@/components/chartTypes';
import type { Loan } from '@/features/finance/loans/types';
import type { Fee } from '@/features/finance/fees/types';
import type { Purchase } from '@/features/finance/purchases/types';
import type { User } from '@/types/User';
import type { Card } from '@/features/finance/cards/types';
import { FinanceChartService } from '@/features/finance/_shared/FinanceChartService';
import { fetchPurchasesByYearAndUser } from '@/features/finance/purchases/api/purchasesApi';
import { queryClient } from '@/config/queryClient';
import { financeKeys } from '@/features/finance/_shared/queryKeys';

export interface UseFinanceChartsOptions {
  loans: Ref<Loan[]>;
  fees: Ref<Fee[]>;
  cardsActive: Ref<Card[]>;
  selectedYear: Ref<number>;
  usersToDisplay: Ref<User[]>;
  getCard: (cardId: number) => Card | undefined;
  months: string[];
}

export function useFinanceCharts(options: UseFinanceChartsOptions) {
  const {
    loans,
    fees,
    cardsActive,
    selectedYear,
    usersToDisplay,
    getCard,
    months,
  } = options;

  // ===== Ref State =====
  const userPurchases = ref<Map<number, Map<string, Purchase[]>>>(new Map());
  const isLoadingPurchases = ref(false);

  // ===== Chart Data Maps =====
  const usersLoansChartData = ref<Map<number, GenericChartData>>(new Map());
  const usersFeesChartData = ref<Map<number, GenericChartData>>(new Map());
  const usersLoansSummaryChartData = ref<Map<number, GenericChartData>>(new Map());
  const usersPurchasesSummaryChartData = ref<Map<number, GenericChartData>>(new Map());
  const usersPurchaseChartData = ref<Map<number, GenericChartData>>(new Map());

  // ===== Computed - Summary Totals =====
  const loansToPay = computed(() => {
    return loans.value.reduce((sum, loan) => {
      return sum + loan.installmentList.reduce((installmentSum, inst) => {
        if (inst.paymentStatus === 'TO_PAY') {
          return installmentSum + inst.installmentAmountToPay;
        }
        return installmentSum;
      }, 0);
    }, 0);
  });

  const feesToPay = computed(() => {
    return fees.value.reduce((sum, fee) => {
      return sum + fee.installmentList.reduce((installmentSum, inst) => {
        if (inst.paymentStatus === 'TO_PAY') {
          return installmentSum + inst.installmentAmountToPay;
        }
        return installmentSum;
      }, 0);
    }, 0);
  });

  const purchasesToPay = computed(() => {
    let total = 0;
    userPurchases.value.forEach(purchasesMap => {
      purchasesMap.forEach(purchases => {
        purchases.forEach(purchase => {
          if (purchase.paymentStatus === 'TO_PAY') {
            total += Number(purchase.amount);
          }
        });
      });
    });
    return total;
  });

  const totalToPay = computed(() => {
    return loansToPay.value + feesToPay.value + purchasesToPay.value;
  });

  // ===== Methods =====

  /**
   * Ładuje zakupy dla wszystkich wyświetlanych użytkowników
   */
  const loadUserPurchases = async (): Promise<void> => {
    userPurchases.value.clear();
    for (const user of usersToDisplay.value) {
      const purchases = await queryClient.fetchQuery({
        queryKey: financeKeys.purchases.byYearUser(selectedYear.value, user.username),
        queryFn: () => fetchPurchasesByYearAndUser(selectedYear.value, user.username),
      });
      userPurchases.value.set(user.id, purchases);
    }
  };

  /**
   * Aktualizuje wszystkie mapy danych wykresów dla wyświetlanych użytkowników
   * Używa FinanceChartService do agregacji danych
   */
  const updateChartData = (): void => {
    usersLoansChartData.value.clear();
    usersFeesChartData.value.clear();
    usersLoansSummaryChartData.value.clear();
    usersPurchasesSummaryChartData.value.clear();
    usersPurchaseChartData.value.clear();

    usersToDisplay.value.forEach(user => {
      // Wykresy miesiące
      usersLoansChartData.value.set(
        user.id,
        FinanceChartService.createLoansChartData(
          loans.value,
          user.id,
          selectedYear.value,
          months
        )
      );

      usersFeesChartData.value.set(
        user.id,
        FinanceChartService.createFeesChartData(fees.value, user.id, selectedYear.value, months)
      );

      // Summary wykresy
      usersLoansSummaryChartData.value.set(
        user.id,
        FinanceChartService.createLoansSummaryChartData(loans.value, user.id)
      );

      usersPurchasesSummaryChartData.value.set(
        user.id,
        FinanceChartService.createPurchasesSummaryChartData(
          cardsActive.value,
          userPurchases.value,
          user.id,
          getCard
        )
      );

      // Wykres zakupów
      const userPurchaseData = userPurchases.value.get(user.id);
      if (userPurchaseData) {
        usersPurchaseChartData.value.set(
          user.id,
          FinanceChartService.createPurchaseChartData(
            user.id,
            userPurchaseData,
            selectedYear.value,
            months,
            getCard
          )
        );
      }
    });
  };

  /**
   * Ładuje dane dla wybranego roku
   * Pobiera użytkowników, karty, kredyty, opłaty i zakupy
   */
  const loadDataForYear = async (
    loadExternalData: () => Promise<void>
  ): Promise<void> => {
    isLoadingPurchases.value = true;

    try {
      // Załaduj dane zewnętrzne (users, cards, loans, fees)
      await loadExternalData();
      // Załaduj zakupy
      await loadUserPurchases();
      // Zaktualizuj mapy danych
      updateChartData();
    } catch (error) {
      console.error('Error loading finance chart data:', error);
    } finally {
      isLoadingPurchases.value = false;
    }
  };

  // ===== Return =====
  return {
    // State
    userPurchases,
    isLoadingPurchases,

    // Chart Data Maps
    usersLoansChartData,
    usersFeesChartData,
    usersLoansSummaryChartData,
    usersPurchasesSummaryChartData,
    usersPurchaseChartData,

    // Summary Totals
    loansToPay,
    feesToPay,
    purchasesToPay,
    totalToPay,

    // Methods
    loadUserPurchases,
    updateChartData,
    loadDataForYear,
  };
}
