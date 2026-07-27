import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3-vite';
import router from '../src/router';
import { queryClient } from '../src/config/queryClient';

import '../src/style.css';
import '../src/assets/tailwind.css';
import 'primeicons/primeicons.css';

setup(app => {
  app.use(createPinia());
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);
  app.use(PrimeVue, { theme: 'none' });
  app.use(ConfirmationService);
  app.use(DialogService);
  app.use(ToastService);
});

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Tryb kolorystyczny',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Jasny' },
          { value: 'dark', title: 'Ciemny' },
        ],
      },
    },
  },
  decorators: [
    (story, context) => {
      const html = document.documentElement;
      html.classList.remove('light', 'dark');
      html.classList.add(context.globals.theme === 'dark' ? 'dark' : 'light');

      return {
        components: { story },
        template:
          '<div class="min-h-screen bg-surface-100 p-6 text-surface-900 dark:bg-surface-900 dark:text-surface-0"><story /></div>',
      };
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
