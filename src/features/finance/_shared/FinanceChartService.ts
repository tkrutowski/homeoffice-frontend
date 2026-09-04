/**
 * Serwis do tworzenia danych dla wykresów finansowych
 * Zawiera funkcje agregowania i transformacji danych w format GenericChartData
 */

import type { GenericChartData } from '@/components/chartTypes';
import { PaymentStatus } from '@/features/finance/payments/types';
import type { Loan } from '@/features/finance/loans/types';
import type { Fee } from '@/features/finance/fees/types';
import type { Card } from '@/features/finance/cards/types';
import type { Purchase } from '@/features/finance/purchases/types';

export class FinanceChartService {
  /**
   * Tworzy dane wykresu kredytów (miesiące - do zapłaty i zapłacone)
   */
  static createLoansChartData(loans: Loan[], userId: number, selectedYear: number, months: string[]): GenericChartData {
    const loansMonthlyToPay: number[] = new Array(12).fill(0);
    const loansMonthlyPaid: number[] = new Array(12).fill(0);

    loans.forEach(loan => {
      if (loan.idUser === userId) {
        loan.installmentList.forEach(installment => {
          if (installment.paymentDeadline) {
            const paymentDate = new Date(installment.paymentDeadline);
            if (paymentDate.getFullYear() === selectedYear) {
              const month = paymentDate.getMonth();
              if (installment.paymentStatus === PaymentStatus.TO_PAY) {
                loansMonthlyToPay[month] += installment.installmentAmountToPay;
              } else if (installment.paymentStatus === PaymentStatus.PAID) {
                loansMonthlyPaid[month] += installment.installmentAmountPaid;
              }
            }
          }
        });
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Kredyty do zapłaty',
          data: loansMonthlyToPay,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
        {
          label: 'Kredyty zapłacone',
          data: loansMonthlyPaid,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
      categoryTotals: [
        {
          label: 'Kredyty do zapłaty',
          total: loansMonthlyToPay.reduce((a, b) => a + b, 0),
          color: 'rgb(239, 68, 68)',
        },
        {
          label: 'Kredyty zapłacone',
          total: loansMonthlyPaid.reduce((a, b) => a + b, 0),
          color: 'rgb(34, 197, 94)',
        },
      ],
    };
  }

  /**
   * Tworzy dane wykresu opłat (miesiące - do zapłaty i zapłacone)
   */
  static createFeesChartData(fees: Fee[], userId: number, selectedYear: number, months: string[]): GenericChartData {
    const feesMonthlyToPay: number[] = new Array(12).fill(0);
    const feesMonthlyPaid: number[] = new Array(12).fill(0);

    fees.forEach(fee => {
      if (fee.idUser === userId) {
        fee.installmentList.forEach(installment => {
          if (installment.paymentDeadline) {
            const paymentDate = new Date(installment.paymentDeadline);
            if (paymentDate.getFullYear() === selectedYear) {
              const month = paymentDate.getMonth();
              if (installment.paymentStatus === PaymentStatus.TO_PAY) {
                feesMonthlyToPay[month] += installment.installmentAmountToPay;
              } else if (installment.paymentStatus === PaymentStatus.PAID) {
                feesMonthlyPaid[month] += installment.installmentAmountPaid;
              }
            }
          }
        });
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Opłaty do zapłaty',
          data: feesMonthlyToPay,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
        {
          label: 'Opłaty zapłacone',
          data: feesMonthlyPaid,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
      categoryTotals: [
        {
          label: 'Opłaty do zapłaty',
          total: feesMonthlyToPay.reduce((a, b) => a + b, 0),
          color: 'rgb(239, 68, 68)',
        },
        {
          label: 'Opłaty zapłacone',
          total: feesMonthlyPaid.reduce((a, b) => a + b, 0),
          color: 'rgb(34, 197, 94)',
        },
      ],
    };
  }

  /**
   * Tworzy dane wykresu podsumowania kredytów (po bankach)
   */
  static createLoansSummaryChartData(loans: Loan[], userId: number): GenericChartData {
    const bankLoanTotals = new Map<number, number>();
    const bankNames = new Map<number, string>();

    loans.forEach(loan => {
      if (loan.idUser === userId) {
        const bank = loan.bank;
        if (bank) {
          bankNames.set(bank.id, bank.name);
          loan.installmentList.forEach(installment => {
            if (installment.paymentStatus === PaymentStatus.TO_PAY) {
              const current = bankLoanTotals.get(bank.id) || 0;
              bankLoanTotals.set(bank.id, current + installment.installmentAmountToPay);
            }
          });
        }
      }
    });

    const bankIds = Array.from(bankLoanTotals.keys());
    const values = Array.from(bankLoanTotals.values());
    const names = bankIds.map(id => bankNames.get(id) || `Bank ${id}`);

    return {
      labels: names,
      datasets: [
        {
          label: 'Kredyty do spłaty',
          data: values,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ],
      categoryTotals: [
        {
          label: 'Kredyty do spłaty',
          total: values.reduce((a, b) => a + b, 0),
          color: 'rgb(239, 68, 68)',
        },
      ],
    };
  }

  /**
   * Tworzy dane wykresu podsumowania zakupów (po kartach)
   */
  static createPurchasesSummaryChartData(
    cardsActive: Card[],
    userPurchases: Map<number, Map<string, Purchase[]>>,
    userId: number,
    getCard: (cardId: number) => Card | undefined
  ): GenericChartData {
    const cardPurchaseTotals = new Map<number, number>();
    const cardNames = new Map<number, string>();

    // Inicjalizuj karty aktywne
    cardsActive.forEach(card => {
      cardPurchaseTotals.set(card.id, 0);
      cardNames.set(card.id, card.name);
    });

    // Zlicz zakupy po kartach
    const userPurchaseData = userPurchases.get(userId);
    if (userPurchaseData) {
      userPurchaseData.forEach(purchases => {
        purchases.forEach(purchase => {
          if (purchase.idUser === userId && purchase.paymentStatus === PaymentStatus.TO_PAY) {
            const cardId = purchase.idCard;
            const card = getCard(cardId);
            if (card && card.activeStatus === 'ACTIVE') {
              const current = cardPurchaseTotals.get(cardId) || 0;
              cardPurchaseTotals.set(cardId, current + Number(purchase.amount));
            }
          }
        });
      });
    }

    const cardIds = Array.from(cardPurchaseTotals.keys());
    const values = Array.from(cardPurchaseTotals.values());
    const names = cardIds.map(id => cardNames.get(id) || `Karta ${id}`);

    return {
      labels: names,
      datasets: [
        {
          label: 'Zakupy do spłaty',
          data: values,
          backgroundColor: 'rgba(251, 191, 36, 0.6)',
          borderColor: 'rgb(251, 191, 36)',
          borderWidth: 1,
        },
      ],
      categoryTotals: [
        {
          label: 'Zakupy do spłaty',
          total: values.reduce((a, b) => a + b, 0),
          color: 'rgb(251, 191, 36)',
        },
      ],
    };
  }

  /**
   * Tworzy dane wykresu zakupów (liniowy - po miesiącach i kartach)
   */
  static createPurchaseChartData(
    userId: number,
    userPurchaseData: Map<string, Purchase[]>,
    selectedYear: number,
    months: string[],
    getCard: (cardId: number) => Card | undefined
  ): GenericChartData {
    const monthlyPurchases: Map<number, Map<number, number>> = new Map();

    // Inicjalizacja mapy dla wszystkich miesięcy
    for (let month = 0; month < 12; month++) {
      monthlyPurchases.set(month, new Map());
    }

    // Przetwórz zakupy
    userPurchaseData.forEach(purchases => {
      purchases.forEach(purchase => {
        if (purchase.idUser === userId && purchase.paymentStatus === PaymentStatus.TO_PAY) {
          if (purchase.paymentDeadline) {
            const paymentDate = new Date(purchase.paymentDeadline);
            if (paymentDate.getFullYear() === selectedYear) {
              const month = paymentDate.getMonth();
              const cardId = purchase.idCard;
              const currentAmount = Number(monthlyPurchases.get(month)?.get(cardId) || 0);
              monthlyPurchases.get(month)?.set(cardId, currentAmount + Number(purchase.amount));
            }
          }
        }
      });
    });

    // Unikalne ID kart
    const cardIds = new Set<number>();
    monthlyPurchases.forEach(monthData => {
      monthData.forEach((_, cardId) => cardIds.add(cardId));
    });

    // Mapa kolorów dla kart
    const getCardColors = (cardId: number) => {
      const colors = [
        { bg: 'rgba(239, 68, 68, 0.5)', border: 'rgb(239, 68, 68)' },
        { bg: 'rgba(59, 130, 246, 0.5)', border: 'rgb(59, 130, 246)' },
        { bg: 'rgba(34, 197, 94, 0.5)', border: 'rgb(34, 197, 94)' },
        { bg: 'rgba(251, 191, 36, 0.5)', border: 'rgb(251, 191, 36)' },
        { bg: 'rgba(168, 85, 247, 0.5)', border: 'rgb(168, 85, 247)' },
        { bg: 'rgba(236, 72, 153, 0.5)', border: 'rgb(236, 72, 153)' },
      ];
      return colors[cardId % colors.length];
    };

    // Utwórz datasety dla każdej karty
    const datasets = Array.from(cardIds).map(cardId => {
      const card = getCard(cardId);
      const data = Array.from({ length: 12 }, (_, month) => {
        return monthlyPurchases.get(month)?.get(cardId) || 0;
      });
      const cardName = card ? card.name : `Karta ${cardId}`;
      const colors = getCardColors(cardId);
      return {
        label: cardName,
        data: data,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
        tension: 0.4,
      };
    });

    const categoryTotals = Array.from(cardIds).map(cardId => {
      const card = getCard(cardId);
      const cardName = card ? card.name : `Karta ${cardId}`;
      const total = datasets.find(d => d.label === cardName)?.data.reduce((a, b) => a + b, 0) || 0;
      const colors = getCardColors(cardId);
      return {
        label: cardName,
        total,
        color: colors.border,
      };
    });

    return {
      labels: months,
      datasets,
      categoryTotals,
    };
  }
}
