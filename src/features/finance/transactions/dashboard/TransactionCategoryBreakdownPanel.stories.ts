import TransactionCategoryBreakdownPanel from '@/features/finance/transactions/dashboard/TransactionCategoryBreakdownPanel.vue';
import { mockCategoryBreakdown } from '@/features/finance/_shared/storybook/fixtures';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Finance/TransactionCategoryBreakdownPanel',
  component: TransactionCategoryBreakdownPanel,
  args: {
    type: 'EXPENSE' as const,
    breakdown: mockCategoryBreakdown,
    periodLabel: 'Lipiec 2026',
    loading: false,
  },
} satisfies Meta<typeof TransactionCategoryBreakdownPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expenses: Story = {};

export const Income: Story = {
  args: {
    type: 'INCOME',
    breakdown: [
      {
        categoryId: 10,
        categoryName: 'Wynagrodzenie',
        count: 1,
        total: 8500,
        color: '#22c55e',
        icon: 'pi pi-wallet',
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    breakdown: [],
  },
};
