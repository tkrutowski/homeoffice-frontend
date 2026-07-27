import { ref } from 'vue';
import BookUrlLookupPanel from '@/features/library/catalog/BookUrlLookupPanel.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Catalog/BookUrlLookupPanel',
  component: BookUrlLookupPanel,
} satisfies Meta<typeof BookUrlLookupPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { BookUrlLookupPanel },
    setup() {
      const searchUrl = ref('https://lubimyczytac.pl/ksiazka/123456/ostatnie-zyczenie');
      return { args, searchUrl };
    },
    template: '<BookUrlLookupPanel v-bind="args" v-model:search-url="searchUrl" />',
  }),
  args: {
    showErrorUrl: false,
    loading: false,
    btnDisabled: false,
  },
};
