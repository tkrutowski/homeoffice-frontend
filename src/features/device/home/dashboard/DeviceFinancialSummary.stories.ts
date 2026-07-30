import DeviceFinancialSummary from '@/features/device/home/dashboard/DeviceFinancialSummary.vue';
import { mockCategoryAggregates } from '@/features/device/_shared/storybook/fixtures';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Device/DeviceFinancialSummary',
  component: DeviceFinancialSummary,
  args: {
    totalValue: 6700,
    valueByCategory: mockCategoryAggregates,
    loading: false,
  },
} satisfies Meta<typeof DeviceFinancialSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { DeviceFinancialSummary },
    setup: () => ({ args }),
    template: '<div class="max-w-4xl p-4"><DeviceFinancialSummary v-bind="args" /></div>',
  }),
};

export const Loading: Story = {
  args: { loading: true },
  render: args => ({
    components: { DeviceFinancialSummary },
    setup: () => ({ args }),
    template: '<div class="max-w-4xl p-4"><DeviceFinancialSummary v-bind="args" /></div>',
  }),
};
