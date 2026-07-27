import BookSmall from '@/features/library/series/BookSmall.vue';
import { mockBookWithoutCover } from '@/features/library/_shared/storybook/fixtures';
import { setupLibraryStorybookStores } from '@/stories/utils/libraryStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Series/BookSmall',
  component: BookSmall,
  args: {
    book: mockBookWithoutCover,
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
