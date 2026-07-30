import TransactionSummaryCards from '@/features/finance/transactions/TransactionSummaryCards.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Finance/TransactionSummaryCards',
  component: TransactionSummaryCards,
  args: {
    netChange: -320.5,
    expenses: 890.4,
    income: 569.9,
    purchasesSum: 245.5,
    loadingPurchases: false,
  },
} satisfies Meta<typeof TransactionSummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PositiveNet: Story = {
  args: {
    netChange: 1200,
    expenses: 400,
    income: 1600,
    purchasesSum: 0,
  },
};
