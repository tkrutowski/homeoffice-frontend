import PurchaseCurrentItem from '@/features/finance/purchases/PurchaseCurrentItem.vue';
import { mockPurchase } from '@/features/finance/_shared/storybook/fixtures';
import { setupFinanceStorybookStores } from '@/stories/utils/financeStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Finance/PurchaseCurrentItem',
  component: PurchaseCurrentItem,
  args: {
    purchase: mockPurchase,
    isSelected: false,
    onToggleSelection: () => undefined,
  },
} satisfies Meta<typeof PurchaseCurrentItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { PurchaseCurrentItem },
    setup() {
      setupFinanceStorybookStores();
      return { args };
    },
    template: '<div class="max-w-xl"><PurchaseCurrentItem v-bind="args" /></div>',
  }),
};
