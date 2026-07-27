import UserBookLarge from '@/features/library/shelf/UserBookLarge.vue';
import { mockUserBook } from '@/features/library/_shared/storybook/fixtures';
import { setupLibraryStorybookStores } from '@/stories/utils/libraryStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Shelf/UserBookLarge',
  component: UserBookLarge,
  args: {
    userbook: mockUserBook,
  },
} satisfies Meta<typeof UserBookLarge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { UserBookLarge },
    setup() {
      setupLibraryStorybookStores();
      return { args };
    },
    template: '<UserBookLarge v-bind="args" />',
  }),
};
