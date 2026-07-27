import BookSmall from '@/features/library/authors/BookSmall.vue';
import { mockBook } from '@/features/library/_shared/storybook/fixtures';
import { setupLibraryStorybookStores } from '@/stories/utils/libraryStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Authors/BookSmall',
  component: BookSmall,
  args: {
    book: mockBook,
  },
} satisfies Meta<typeof BookSmall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { BookSmall },
    setup() {
      setupLibraryStorybookStores();
      return { args };
    },
    template: '<BookSmall v-bind="args" />',
  }),
};
