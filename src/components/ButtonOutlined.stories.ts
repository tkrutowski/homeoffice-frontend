import ButtonOutlined from '@/components/ButtonOutlined.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Shared/ButtonOutlined',
  component: ButtonOutlined,
  args: {
    text: 'Anuluj',
    btnDisabled: false,
    loading: false,
    icon: 'pi pi-times',
    iconPos: 'left' as const,
  },
} satisfies Meta<typeof ButtonOutlined>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    btnDisabled: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
