import type { Bank } from '@/features/finance/banks/types';
import type { Card } from '@/features/finance/cards/types';
import type { Fee } from '@/features/finance/fees/types';
import type { Loan } from '@/features/finance/loans/types';
import type { Payment } from '@/features/finance/payments/types';
import { PaymentStatus } from '@/features/finance/payments/types';
import type { Purchase } from '@/features/finance/purchases/types';
import type { BankTransaction, TransactionCategoryDto } from '@/features/finance/transactions/types';
import { TransactionType } from '@/features/finance/transactions/types';
import type { CategoryBreakdownItem } from '@/features/finance/transactions/dashboardTypes';

export const mockBank: Bank = {
  id: 1,
  name: 'mBank',
  address: { id: 1, city: 'Warszawa', street: 'Prosta 1', zip: '00-001' },
  phone: '500100200',
  phone2: '',
  fax: '',
  mail: 'kontakt@mbank.pl',
  www: 'https://www.mbank.pl',
  otherInfo: '',
};

export const mockCard: Card = {
  id: 10,
  idBank: 1,
  idUser: 1,
  name: 'Visa Gold',
  activationDate: new Date('2024-01-15'),
  limit: 8000,
  repaymentDay: 10,
  expirationDate: new Date('2028-12-31'),
  otherInfo: '',
  activeStatus: 'ACTIVE',
  cardNumber: '**** 4242',
  closingDay: 25,
  imageUrl: '',
  multi: false,
};

export const mockLoan: Loan = {
  id: 100,
  bank: mockBank,
  idUser: 1,
  name: 'Kredyt hipoteczny',
  amount: 350000,
  date: new Date('2022-06-01'),
  loanNumber: 'LOAN-100',
  accountNumber: '12 3456 7890 1234 5678 9012 3456',
  firstPaymentDate: new Date('2022-07-01'),
  numberOfInstallments: 360,
  installmentAmount: 2100,
  loanStatus: PaymentStatus.TO_PAY,
  loanCost: 12000,
  otherInfo: '',
  installmentList: [
    {
      idLoanInstallment: 1,
      idLoan: 100,
      installmentNumber: 1,
      installmentAmountToPay: 2100,
      installmentAmountPaid: 0,
      paymentDeadline: new Date('2026-08-01'),
      paymentDate: null,
      paymentStatus: PaymentStatus.TO_PAY,
    },
  ],
};

export const mockFee: Fee = {
  id: 200,
  firm: {
    id: 5,
    name: 'Orange',
    phone: '',
    phone2: '',
    fax: '',
    mail: '',
    www: '',
    otherInfo: '',
    address: { id: 1, city: 'Warszawa', street: 'Testowa 1', zip: '00-001' },
  },
  idUser: 1,
  name: 'Internet',
  feeNumber: 'FEE-200',
  date: new Date('2026-01-01'),
  feeFrequency: { name: 'MONTHLY', viewName: 'Miesięcznie', frequencyNumber: 1 },
  numberOfPayments: 12,
  amount: 79.99,
  firstPaymentDate: new Date('2026-01-10'),
  accountNumber: '',
  feeStatus: PaymentStatus.TO_PAY,
  otherInfo: '',
  installmentList: [
    {
      idFeeInstallment: 1,
      idFee: 200,
      installmentAmountToPay: 79.99,
      installmentAmountPaid: 0,
      paymentDeadline: new Date('2026-08-10'),
      paymentDate: null,
      paymentStatus: PaymentStatus.TO_PAY,
    },
  ],
};

export const mockPayment: Payment = {
  id: 300,
  idUser: 1,
  name: 'Kredyt hipoteczny',
  paymentDay: 1,
  paymentType: 'LOAN',
  paymentStatus: PaymentStatus.TO_PAY,
  installments: mockLoan.installmentList,
  idIssuer: 100,
};

export const mockPurchase: Purchase = {
  id: 400,
  idCard: 10,
  idFirm: 5,
  idUser: 1,
  name: 'Zakupy spożywcze',
  purchaseDate: new Date('2026-07-20'),
  amount: 245.5,
  paymentDeadline: new Date('2026-08-10'),
  paymentDate: null,
  otherInfo: 'Biedronka',
  paymentStatus: PaymentStatus.TO_PAY,
  installment: false,
};

export const mockCategory: TransactionCategoryDto = {
  id: 1,
  name: 'Jedzenie',
  type: 'EXPENSE',
  icon: 'pi pi-shopping-cart',
  color: '#ef4444',
};

export const mockTransaction: BankTransaction = {
  id: 500,
  idFirm: 5,
  idUser: 1,
  purchaseId: 400,
  description: 'Płatność kartą — Biedronka',
  transactionDate: '2026-07-20',
  amount: '-245.50',
  transactionType: TransactionType.CARD_PAYMENT,
  transactionCategory: mockCategory,
  transactionLabel: [{ id: 1, name: 'spożywcze' }],
  boughtOnCredit: true,
};

export const mockCategoryBreakdown: CategoryBreakdownItem[] = [
  {
    categoryId: 1,
    categoryName: 'Jedzenie',
    count: 12,
    total: 890.4,
    color: '#ef4444',
    icon: 'pi pi-shopping-cart',
  },
  {
    categoryId: 2,
    categoryName: 'Transport',
    count: 4,
    total: 320,
    color: '#3b82f6',
    icon: 'pi pi-car',
  },
  {
    categoryId: null,
    categoryName: 'Bez kategorii',
    count: 2,
    total: 55.2,
    color: '#94a3b8',
    icon: null,
  },
];
