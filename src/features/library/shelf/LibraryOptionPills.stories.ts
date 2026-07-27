import { ref } from 'vue';
import LibraryOptionPills from '@/features/library/shelf/LibraryOptionPills.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Shelf/LibraryOptionPills',
  component: LibraryOptionPills,
} satisfies Meta<typeof LibraryOptionPills>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    modelValue: 'have',
    options: [
      { value: 'have', label: 'Mam', icon: 'pi pi-check' },
      { value: 'want', label: 'Chcę', icon: 'pi pi-bookmark' },
      { value: 'read_only', label: 'Wypożyczona', icon: 'pi pi-book' },
    ],
  },
  render: args => ({
    components: { LibraryOptionPills },
    setup() {
      const model = ref('have');
      const options = [
        { value: 'have', label: 'Mam', icon: 'pi pi-check' },
        { value: 'want', label: 'Chcę', icon: 'pi pi-bookmark' },
        { value: 'read_only', label: 'Wypożyczona', icon: 'pi pi-book' },
      ];
      return { args, model, options };
    },
    template: '<LibraryOptionPills v-bind="args" :options="options" v-model="model" />',
  }),
};
