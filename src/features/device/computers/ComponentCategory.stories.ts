import ComponentCategory from '@/features/device/computers/ComponentCategory.vue';
import { mockComputer } from '@/features/device/_shared/storybook/fixtures';
import type { ComponentType } from '@/features/device/computers/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const componentType: ComponentType = {
  name: 'PROCESSOR',
  max: 1,
  viewName: 'Procesor',
  column: 'processor',
};

const meta = {
  title: 'Device/ComponentCategory',
  component: ComponentCategory,
  args: {
    componentType,
    computer: mockComputer,
  },
} satisfies Meta<typeof ComponentCategory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { ComponentCategory },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><ComponentCategory v-bind="args" /></div>',
  }),
};
