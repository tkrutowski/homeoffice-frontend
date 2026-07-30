import TransactionItem from '@/features/finance/transactions/TransactionItem.vue';
import { mockTransaction } from '@/features/finance/_shared/storybook/fixtures';
import { setupFinanceStorybookStores } from '@/stories/utils/financeStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Finance/TransactionItem',
  component: TransactionItem,
  args: {
    transaction: mockTransaction,
  },
} satisfies Meta<typeof TransactionItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { TransactionItem },
    setup() {
      setupFinanceStorybookStores();
      return { args };
    },
    template: '<div class="max-w-2xl"><TransactionItem v-bind="args" /></div>',
  }),
};
