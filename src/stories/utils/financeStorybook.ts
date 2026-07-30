import {
  mockBank,
  mockCard,
  mockFee,
  mockLoan,
  mockPayment,
  mockPurchase,
  mockTransaction,
  mockCategory,
} from '@/features/finance/_shared/storybook/fixtures';
import { queryClient } from '@/config/queryClient';
import {
  financeKeys,
  type LoanPageParams,
  type FeePageParams,
  type PurchasePageParams,
} from '@/features/finance/_shared/queryKeys';
import { PaymentStatus } from '@/features/finance/payments/types';
import { useAuthorizationStore } from '@/stores/authorization';
import { useFirmsStore } from '@/stores/firms';

const defaultLoanPageParams: LoanPageParams = { page: 0, size: 20, sort: 'date', direction: 'DESC' };
const defaultFeePageParams: FeePageParams = { page: 0, size: 20, sort: 'date', direction: 'DESC' };
const defaultPurchasePageParams: PurchasePageParams = { page: 0, size: 20, sort: 'id', direction: 'DESC' };

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJhdXRob3JpdGllcyI6WyJST0xFX0ZJTkFOQ0UiLCJST0xFX0FETUlOIl0sImV4cCI6NDA3MDkwODgwMH0.' +
  'signature';

export function setupFinanceStorybookStores() {
  const authStore = useAuthorizationStore();
  authStore.accessToken = mockToken;
  authStore.isAuthenticated = true;
  authStore.username = 'storybook';

  queryClient.setQueryData(financeKeys.banks.list(), [mockBank]);
  queryClient.setQueryData(financeKeys.cards.list('ALL'), [mockCard]);
  queryClient.setQueryData(financeKeys.loans.page(defaultLoanPageParams), {
    content: [mockLoan],
    totalElements: 1,
    number: 0,
  });
  queryClient.setQueryData(financeKeys.fees.page(defaultFeePageParams), {
    content: [mockFee],
    totalElements: 1,
    number: 0,
    totalPages: 1,
  });

  queryClient.setQueryData(
    financeKeys.payments.byStatusYear(PaymentStatus.ALL, new Date().getFullYear()),
    new Map([['1', [mockPayment]]])
  );

  queryClient.setQueryData(financeKeys.purchases.page(defaultPurchasePageParams), {
    content: [mockPurchase],
    totalElements: 1,
    number: 0,
    totalPages: 1,
  });
  queryClient.setQueryData(financeKeys.purchases.detail(mockPurchase.id), mockPurchase);
  queryClient.setQueryData(
    financeKeys.purchases.current('storybook'),
    new Map<string, Array<typeof mockPurchase>>([['2026-08-10', [mockPurchase]]])
  );
  queryClient.setQueryData(financeKeys.purchases.sumToPay(), mockPurchase.amount);

  queryClient.setQueryData(financeKeys.transactions.categories(), [mockCategory]);
  queryClient.setQueryData(financeKeys.transactions.labels(), [{ id: 1, name: 'Dom' }]);
  queryClient.setQueryData(financeKeys.transactions.between('2026-07-01', '2026-07-31'), [mockTransaction]);

  const firmsStore = useFirmsStore();
  firmsStore.firms = [
    {
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
  ];
  firmsStore.getFirm = (id: number) => firmsStore.firms.find(f => f.id === id) ?? null;
  firmsStore.getFirmsFromDb = async () => undefined;
}
