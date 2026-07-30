import PayPaymentDialog from '@/features/finance/payments/PayPaymentDialog.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Finance/PayPaymentDialog',
  component: PayPaymentDialog,
  args: {
    date: new Date('2026-08-01'),
    amount: 2100,
    isEdit: false,
  },
  render: args => ({
    components: { PayPaymentDialog },
    setup() {
      return { args, visible: true };
    },
    template: `
      <Dialog v-model:visible="visible" modal header="Zapłać ratę" class="w-[28rem]">
        <PayPaymentDialog v-bind="args" @save="() => {}" @cancel="() => {}" />
      </Dialog>
    `,
  }),
} satisfies Meta<typeof PayPaymentDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Edit: Story = {
  args: {
    isEdit: true,
    amount: 1500,
  },
};
