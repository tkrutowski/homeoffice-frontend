import DeviceCategoryBreakdown from '@/features/device/home/dashboard/DeviceCategoryBreakdown.vue';
import { mockCategoryAggregates } from '@/features/device/_shared/storybook/fixtures';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Device/DeviceCategoryBreakdown',
  component: DeviceCategoryBreakdown,
  args: {
    categories: mockCategoryAggregates,
    maxCount: 5,
    loading: false,
  },
} satisfies Meta<typeof DeviceCategoryBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { DeviceCategoryBreakdown },
    setup: () => ({ args }),
    template: '<div class="max-w-md p-4"><DeviceCategoryBreakdown v-bind="args" /></div>',
  }),
};
