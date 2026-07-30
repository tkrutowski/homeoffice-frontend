import DeviceAlertsList from '@/features/device/home/dashboard/DeviceAlertsList.vue';
import { mockAlerts } from '@/features/device/_shared/storybook/fixtures';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Device/DeviceAlertsList',
  component: DeviceAlertsList,
  args: {
    alerts: mockAlerts,
    loading: false,
  },
} satisfies Meta<typeof DeviceAlertsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { DeviceAlertsList },
    setup: () => ({ args }),
    template: '<div class="max-w-md p-4"><DeviceAlertsList v-bind="args" /></div>',
  }),
};
