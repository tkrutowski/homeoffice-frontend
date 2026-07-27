import { onMounted } from 'vue';
import router from '@/router';
import TheMenuLibrary from '@/features/library/_shared/TheMenuLibrary.vue';
import { setupLibraryStorybookStores } from '@/stories/utils/libraryStorybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Library/Shared/TheMenuLibrary',
  component: TheMenuLibrary,
} satisfies Meta<typeof TheMenuLibrary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { TheMenuLibrary },
    setup() {
      setupLibraryStorybookStores();
      onMounted(async () => {
        await router.push('/homelib');
      });
      return { args };
    },
    template: '<TheMenuLibrary v-bind="args" />',
  }),
};
