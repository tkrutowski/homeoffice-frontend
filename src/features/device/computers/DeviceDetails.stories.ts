import DeviceDetails from '@/features/device/computers/DeviceDetails.vue';
import { mockDevice } from '@/features/device/_shared/storybook/fixtures';
import type { ComponentType } from '@/features/device/computers/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const componentType: ComponentType = {
  name: 'PROCESSOR',
  max: 1,
  viewName: 'Procesor',
  column: 'processor',
};

const meta = {
  title: 'Device/DeviceDetails',
  component: DeviceDetails,
  args: {
    devices: [mockDevice],
    componentType,
  },
} satisfies Meta<typeof DeviceDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { DeviceDetails },
    setup: () => ({ args }),
    template: '<div class="max-w-2xl p-4"><DeviceDetails v-bind="args" /></div>',
  }),
};
