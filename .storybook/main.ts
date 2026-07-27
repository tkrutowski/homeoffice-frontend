import { fileURLToPath, URL } from 'node:url';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: [],
  framework: '@storybook/vue3-vite',
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      plugins: [
        Components({
          resolvers: [PrimeVueResolver()],
        }),
      ],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url)),
        },
      },
    });
  },
};

export default config;