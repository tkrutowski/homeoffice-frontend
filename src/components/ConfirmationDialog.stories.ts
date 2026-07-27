import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Shared/ConfirmationDialog',
  component: ConfirmationDialog,
  args: {
    visible: true,
    msg: 'Czy na pewno chcesz kontynuować?',
    label: 'Potwierdź',
  },
} satisfies Meta<typeof ConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
