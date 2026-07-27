import FormSectionCard from '@/components/FormSectionCard.vue';
import { BookOpenIcon } from '@heroicons/vue/24/outline';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Shared/FormSectionCard',
  component: FormSectionCard,
  args: {
    title: 'Sekcja formularza',
    icon: BookOpenIcon,
    description: 'Przykładowy opis sekcji w Storybook.',
  },
} satisfies Meta<typeof FormSectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => ({
    components: { FormSectionCard },
    setup() {
      return { args };
    },
    template: `
      <FormSectionCard v-bind="args">
        <div class="text-sm text-surface-700 dark:text-surface-300">
          Treść sekcji.
        </div>
      </FormSectionCard>
    `,
  }),
};
