import UserBookSmall from '@/features/library/shelf/UserBookSmall.vue';
import { mockUserBook } from '@/features/library/_shared/storybook/fixtures';
import { setupLibraryStorybookStores } from '@/stories/utils/libraryStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Shelf/UserBookSmall',
  component: UserBookSmall,
  args: {
    userbook: mockUserBook,
  },
} satisfies Meta<typeof UserBookSmall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { UserBookSmall },
    setup() {
      setupLibraryStorybookStores();
      return { args };
    },
    template: '<UserBookSmall v-bind="args" />',
  }),
};
