import { ref } from 'vue';
import ReadingStatusStepper from '@/features/library/shelf/ReadingStatusStepper.vue';
import { ReadingStatus } from '@/features/library/shelf/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Shelf/ReadingStatusStepper',
  component: ReadingStatusStepper,
} satisfies Meta<typeof ReadingStatusStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    modelValue: ReadingStatus.READ_NOW,
  },
  render: args => ({
    components: { ReadingStatusStepper },
    setup() {
      const model = ref(ReadingStatus.READ_NOW);
      return { args, model };
    },
    template: '<ReadingStatusStepper v-bind="args" v-model="model" />',
  }),
};
