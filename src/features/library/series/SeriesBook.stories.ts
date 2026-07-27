import SeriesBook from '@/features/library/series/SeriesBook.vue';
import { mockBook } from '@/features/library/_shared/storybook/fixtures';
import { setupLibraryStorybookStores } from '@/stories/utils/libraryStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Series/SeriesBook',
  component: SeriesBook,
  args: {
    book: mockBook,
  },
} satisfies Meta<typeof SeriesBook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { SeriesBook },
    setup() {
      setupLibraryStorybookStores();
      return { args };
    },
    template: '<SeriesBook v-bind="args" />',
  }),
};
