import TheMenuFinance from '@/features/finance/_shared/TheMenuFinance.vue';
import { setupFinanceStorybookStores } from '@/stories/utils/financeStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Finance/TheMenuFinance',
  component: TheMenuFinance,
} satisfies Meta<typeof TheMenuFinance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { TheMenuFinance },
    setup() {
      setupFinanceStorybookStores();
    },
    template: '<TheMenuFinance />',
  }),
};
