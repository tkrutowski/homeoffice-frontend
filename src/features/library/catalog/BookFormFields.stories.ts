import { ref } from 'vue';
import BookFormFields from '@/features/library/catalog/BookFormFields.vue';
import { mockAuthors, mockBook, mockCategories, mockSeries } from '@/features/library/_shared/storybook/fixtures';
import type { Author, Book, Category, Series } from '@/features/library/shelf/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Catalog/BookFormFields',
  component: BookFormFields,
} satisfies Meta<typeof BookFormFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    book: mockBook,
    selectedAuthors: mockAuthors,
    selectedSeries: mockSeries[0],
    selectedCategories: mockCategories,
  },
  render: args => ({
    components: { BookFormFields },
    setup() {
      const book = ref<Book>({ ...mockBook });
      const selectedAuthors = ref<Author[]>([...mockAuthors]);
      const selectedSeries = ref<Series | null>(mockSeries[0]);
      const selectedCategories = ref<Category[]>([...mockCategories]);

      return {
        args,
        book,
        selectedAuthors,
        selectedSeries,
        selectedCategories,
        mockAuthors,
        mockSeries,
        mockCategories,
      };
    },
    template: `
      <BookFormFields
        v-bind="args"
        v-model:book="book"
        v-model:selected-authors="selectedAuthors"
        v-model:selected-series="selectedSeries"
        v-model:selected-categories="selectedCategories"
        :filtered-authors="mockAuthors"
        :filtered-series="mockSeries"
        :filtered-categories="mockCategories"
      />
    `,
  }),
};
