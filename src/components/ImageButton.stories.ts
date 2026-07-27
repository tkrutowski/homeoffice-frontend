import ImageButton from '@/components/ImageButton.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Shared/ImageButton',
  component: ImageButton,
  args: {
    imgSrc: 'add-to-shell',
    width: '40px',
    height: '40px',
    btnDisabled: false,
  },
} satisfies Meta<typeof ImageButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddToShelf: Story = {};

export const Reading: Story = {
  args: {
    imgSrc: 'reading',
  },
};

export const AlreadyRead: Story = {
  args: {
    imgSrc: 'read',
  },
};
