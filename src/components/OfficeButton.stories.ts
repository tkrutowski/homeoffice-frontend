import OfficeButton from '@/components/OfficeButton.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Shared/OfficeButton',
  component: OfficeButton,
  args: {
    text: 'Zapisz',
    btnType: 'office-regular',
    btnDisabled: false,
    loading: false,
  },
} satisfies Meta<typeof OfficeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};

export const SaveVariant: Story = {
  args: {
    btnType: 'office-save',
    text: 'Usuń',
  },
};

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
