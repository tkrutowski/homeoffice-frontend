import OfficeIconButton from '@/components/OfficeIconButton.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Shared/OfficeIconButton',
  component: OfficeIconButton,
  args: {
    icon: 'pi pi-search',
    btnDisabled: false,
    loading: false,
    active: false,
    attention: false,
  },
} satisfies Meta<typeof OfficeIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Attention: Story = {
  args: {
    attention: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
